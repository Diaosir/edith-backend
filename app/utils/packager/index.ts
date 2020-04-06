import findDependencyDependencies from "./dependencies/find-dependency-dependencies";
import installDependencies from "./dependencies/install-dependencies";
import * as cache from './utils/cache'
import findPackageInfos, { IPackage } from "./packages/find-package-infos";
import findRequires, { IFileData } from "./packages/find-requires";
import { fs } from "mz";
import * as path from "path";
import * as rimraf from "rimraf";
import mergeResults from './utils/merge-results'
import getHash from "./utils/get-hash";
async function getContents(
  dependency: any,
  packagePath: string,
  packageInfos: { [p: string]: IPackage },
): Promise<IFileData> {
  const contents = await findRequires(
    dependency.name,
    packagePath,
    packageInfos,
  );
  console.log(packagePath)
  // console.log(newContents)
  const packageJSONFiles = Object.keys(packageInfos).reduce(
    (total, next) => ({
      ...total,
      [next.replace(packagePath, "")]: {
        content: JSON.stringify(packageInfos[next]),
      },
    }),
    {},
  );
  return { ...contents, ...packageJSONFiles };
}
let packaging = false;
export async function getPackage(packageString: string) {
  const packageParts = packageString.split("@");
  const version = packageParts.pop();
  const dependency = { name: packageParts.join("@") || '', version: version || '' };
  const hash = getHash(dependency);
  const t = Date.now();
  if (!hash) {
    return;
  }
  const cacheData = await cache.get(hash)
  if(cacheData) {
    return JSON.parse(cacheData);
  }
  let packagePath = path.join("/tmp", hash);
  if(!packaging) {
    console.log("Cleaning up /tmp");
    try {
      const folders = fs.readdirSync("/tmp");

      folders.forEach(f => {
        const p = path.join("/tmp/", f);
        try {
          if (fs.statSync(p).isDirectory() && p !== "/tmp/git") {
            rimraf.sync(p);
          }
        } catch (e) {
          console.error("Could not delete " + p + ", " + e.message);
        }
      });
    } catch (e) {
      console.error("Could not delete dependencies: " + e.message);
      console.log("Continuing packaging...");
    }
  }
  packaging = true;
  try {
    await installDependencies(dependency, packagePath);

    const packageInfos = await findPackageInfos(dependency.name, packagePath);

    const contents = await getContents(dependency, packagePath, packageInfos);

    console.log(
      "Done - " +
        (Date.now() - t) +
        " - " +
        dependency.name +
        "@" +
        dependency.version,
    );

    const requireStatements = new Set<string>();
    Object.keys(contents).forEach(p => {
      const c = contents[p];
      if (c.requires) {
        c.requires.forEach(r => requireStatements.add(r));
      }
    });

    const response = {
      contents,
      dependency,
      ...findDependencyDependencies(
        dependency,
        packagePath,
        packageInfos,
        requireStatements,
      ),
    };
    // Cleanup
    try {
      rimraf.sync(packagePath);
    } catch (e) {
      /* ignore */
    }
    await cache.set(hash, JSON.stringify(response));
    return response
  } catch (e) {
    // Cleanup
    try {
      rimraf.sync(packagePath);
    } catch (e) {
      /* ignore */
    }
    return { error: e.message }
  } finally {
    packaging = false;
  }
}
export async function packager(packages: Array<string>) {
  let results = await Promise.all(packages.map(async packageStr => {
    return await getPackage(packageStr)
  }))
  results = results.filter((result: any) => {
    return !!result && !result.error && !!result.dependency
  })
  return mergeResults(results)
}

