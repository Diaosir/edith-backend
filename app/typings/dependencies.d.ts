interface IDependency {
  entries: Array<string>;
  parents: Array<string>;
  resolved: string;
  semver: string;
}
interface IDependencies {
  [key: string]: IDependency
}