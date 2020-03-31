import { Service } from 'egg';
import * as fs from 'fs'
import * as childrenProcess from 'child_process';
import * as path from 'path'
import * as md5 from 'md5'
// import _ from 'lodash'
import getModule, { EdithModule } from '../utils/module'
// import * as _ from 'lodash'
interface IContent {
  content: string;
  requires?: Array<string>;
}
export default class PackageService extends Service {
  async combinations(packages: Array<string>): Promise<{
    contents: {
      [key: string]: IContent
    },
    dependencies: any;
    devDependencies: IDependencies;
  }> {
    EdithModule._cache = {};
    const id = md5(packages.join(''))
    const { baseDir } = this.ctx.app;
    const  edith_node_modules_path = path.join(baseDir, 'edith_node_modules', id)
    await this.install(edith_node_modules_path, packages)
    const { dependencies, devDependencies } = await this.getDependencies(edith_node_modules_path, packages);
    let contents: any = {};
    await Promise.all(dependencies.map(async (item) => {
      const { entries } = devDependencies[item.name]
      if(Array.isArray(entries) && entries.length > 0){
        await this.getContent(edith_node_modules_path, contents, `${item.name}/${entries[0]}`);
      }
    }))
    return {
      contents,
      dependencies,
      devDependencies
    }
  }
  async install(edith_node_modules_path: string, params: Array<string>) {
    try{
      fs.mkdirSync(edith_node_modules_path)
    } catch(error) {

    }
    return new Promise((resolve) => {
      const cnpm = childrenProcess.spawn('cnpm', ['install', '--production'].concat(params), { cwd: edith_node_modules_path});
      cnpm.stdout.on('data', (data) => {
        console.log(data.toString());
      });
      
      cnpm.stderr.on('data', (data) => {
        console.error(data.toString());
      });
      cnpm.on('close', () => {
        resolve(true);
      });
    })
  }
  async getContent(edith_node_modules_path: string, contents: {
    [key: string]: IContent
  }, entry: string) {
    const module = await getModule(entry, null, path.join(edith_node_modules_path, '/node_modules'));
    if(module) {
      const content = await module.getContents();
      Object.keys(content).forEach(key => {
        contents[key] = content[key];
      })
    }
  }
  async getDependencies(edith_node_modules_path: string, packages: Array<string>): Promise<{
    dependencies: any;
    devDependencies: IDependencies
  }> {
    const devDependencies = {};
    const packs = await Promise.all(packages.map(async item => {
      const name = item.split('@')[0];
      const packageJson = await this.getPackageJson(edith_node_modules_path, name)
      const semver = item.split('@')[1];
      await this.getDevDependencies(
        edith_node_modules_path,
        name,
        devDependencies,
        '',
        semver
      )
      return {
        name,
        resolved: packageJson.version,
        semver,
        main: packageJson.main
      };
    }))
    return {
      dependencies: packs,
      devDependencies
    }
  }
  async getDevDependencies(edith_node_modules_path: string, name: string, devDependencies: any = {}, parent: string = '', semver: string = '') {
    const packageJson = await this.getPackageJson(edith_node_modules_path, name)
    if(!packageJson.name) {
      return null;
    }
    const dependencies = packageJson.dependencies;
    if(!!dependencies) {
      await Promise.all(Object.keys(dependencies).map(async devDependenyName => {
        await this.getDevDependencies(edith_node_modules_path, devDependenyName, devDependencies, name, dependencies[devDependenyName]);
      }))
    }
    const dependeny = devDependencies[name] || {};
    let parents = dependeny.parents || [];
    if(parent && parents.indexOf(parent) === -1) {
      parents = parents.concat([parent]);
    }
    devDependencies[name] = {
      ...dependeny,
      entries: packageJson.main ? [packageJson.main] : [],
      parents,
      resolved: packageJson.version,
      semver
    }
    return devDependencies[name];
  }
  async getPackageJson(edith_node_modules_path: string, name: string): Promise<any> {
    try{
      return JSON.parse(fs.readFileSync(path.join(edith_node_modules_path, 'node_modules', name, 'package.json'), 'utf-8'));
    } catch(error) {
      console.log(error)
      return {}
    }
  }
}