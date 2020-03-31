import * as _ from 'lodash'
export function formatPackages(str: string): Array<string> {
  str = str.replace(/\.json$/, '')
  return str.split('+');
}
