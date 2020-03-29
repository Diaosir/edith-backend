import * as fs from 'fs'
// import * as childrenProcess from 'child_process';
const path = require('path');
enum IStat {
  FILE,
  DIRECTORY
}
// import * as md5 from 'md5'
/**
1、先从缓存中读取，如果没有则继续往下

2、判断需要模块路径是否以/结尾，如果不是，则要判断

    a. 检查是否是一个文件，如果是，则转换为真实路径

    b. 否则如果是一个目录，则调用tryPackage方法读取该目录下的package.json文件，把里面的main属性设置为filename

    c. 如果没有读到路径上的文件，则通过tryExtensions尝试在该路径后依次加上.js，.json和.node后缀，判断是否存在，若存在则返回加上后缀后的路径

3、如果依然不存在，则同样调用tryPackage方法读取该目录下的package.json文件，把里面的main属性设置为filename

4、如果依然不存在，则尝试在该路径后依次加上index.js，index.json和index.node，判断是否存在，若存在则返回拼接后的路径。

5、若解析成功，则把解析得到的文件名cache起来，下次require就不用再次解析了，否则若解析失败，则返回false
 */
class EdithModule{
  public id: string;
  public filename: string = '';
  public parent: EdithModule;
  public code: string;
  public children: Array<any> = [];
  public request: string;
  public node_modules_path: string;
  static _cache = {};
  static _extensions = {};
  static _pathCache = {};
  static contents = {};
  static statCache = new Map();
  constructor(request: string, parent: EdithModule, node_modules_path: string) {
    this.parent = parent;
    this.request = request;
    // if (parent && parent.children) {
    //   parent.children.push(this);
    // }
    this.node_modules_path = node_modules_path;
    this.filename = EdithModule._resolveFilename(this.request, this.parent, this.node_modules_path);
  }
  public async getContents() {
    try{
      this.code = fs.readFileSync(this.filename, 'utf-8');
      EdithModule._cache[this.filename] = this;
      this.children = EdithModule._getChilrenList(this.code);
      await Promise.all((this.children.map(async (filePath) => {
        const childrenModule = await getModule(filePath, this, this.node_modules_path);
        await childrenModule.getContents();
      })))
    } catch(error) {
      this.code = 'can not find this filename'
    }
    EdithModule.contents[path.join(this.filename.replace(this.node_modules_path, ''))] = {
      contents: this.code,
      require: this.children
    }
    return EdithModule.contents;
  }
  static _getChilrenList(code: string): Array<any> {
    const reg = /\s*require\s*\(\s*['"]([^'"]*)['"]\s*\)/g;
    const match = code.match(reg);
    if(Array.isArray(match)) {
      return match.map(item => {
        return item.replace(/^\s*require\s*\(\s*['"]/, '')
                   .replace(/['"]\s*\)$/, '')
      })
    }
    return match || []
  }
  static _resolveFilename(request, parent: EdithModule, node_modules_path): string {
    const paths = [ parent ? parent.filename : ''];
    const parentPath = paths[0];
    let basePath = parentPath ? path.resolve(path.dirname(parentPath), request) : request;
    let filename = basePath;
    if(!path.isAbsolute(basePath)) {
      filename = path.join(node_modules_path, basePath);
    }
    //判断需要模块路径是否以/结尾
    if(!filename.match(/\/$/)) {
      const rc = EdithModule._stat(filename);
      if(rc === 0) { //file

      } else if(rc === 1) { //directory

      }
    } else {

    }
    return filename;
  }
  static _stat(filename): IStat {
    filename = path._makeLong(filename);
    const cache = EdithModule.statCache;
    if (cache !== null) {
      const result = cache.get(filename);
      if (result !== undefined) return result;
    }
    try {
      const stat = fs.statSync(filename);
      if (cache !== null) cache.set(filename, stat);
    } catch(error) {
      
    }
    return -1;
  }
}
function getModule(request: string, parent: any, node_modules_path: string = '/node_modules'): EdithModule {
  const filename = EdithModule._resolveFilename(request, parent, node_modules_path)
  if(EdithModule._cache[filename]) {
    return EdithModule._cache[filename]
  } else {
    return new EdithModule(request, parent, node_modules_path);
  }
}
export default getModule;
