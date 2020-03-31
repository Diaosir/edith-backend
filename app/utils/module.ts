import * as fs from 'fs'
import babelTemplate from '@babel/template'
// import * as childrenProcess from 'child_process';
const cachePaths = {}
const numCPUs = require('os').cpus().length;
const fork = require('child_process').fork;

const path = require('path');
interface ITask {
  data: any;
  options?: any;
  callbacks: Array<(error, result) => void>;
}
enum IStat {
  FILE,
  DIRECTORY
}
function resolve(requestPath: string, dest: string) {
  if(requestPath.match(/\.\w+$/)) {
    return path.resolve(path.dirname(requestPath), dest);
  } else {
    return path.resolve(requestPath, dest);
  }
}
function readPackage(requestPath: string) {
  var jsonPath = resolve(requestPath, 'package.json');
  var pkg = null;
  try {
    var json = fs.readFileSync(jsonPath, 'utf-8');
    pkg = JSON.parse(json).main || 'index.js';
  } catch (e) {
    e.path = jsonPath;
    e.message = 'Error parsing ' + jsonPath + ': ' + e.message;
    // throw e;
  }
  return pkg;
}
// import * as md5 from 'md5'
export class EdithModule{
  public id: string;
  public filename: string = '';
  public parent: EdithModule | null;
  public code: string;
  public children: Array<any> = [];
  public request: string;
  public node_modules_path: string;
  public isLoad: boolean = false;
  static _cache = {};
  static _extensions = {
    '.js': function(){

    },
    '.json': function(){

    }
  };
  static _pathCache = {};
  static contents = {};
  static statCache = new Map();
  static workers: Array<Worker> = [];
  static freeWorkers: Array<Worker> = [];
  static loadingWorkers: number = 0;
  static workerCount: number = 3;
  static taskQueue: {
    [path: string]: ITask;
  } = {};
  constructor(request: string, parent: EdithModule | null, node_modules_path: string, filename: string) {
    this.parent = parent;
    this.request = request;
    // if (parent && parent.children) {
    //   parent.children.push(this);
    // }
    this.node_modules_path = node_modules_path;
    this.filename = filename;
    EdithModule._cache[filename] = this;
  }
  public async getContents() {
    if(this.isLoad) {
      return {};
    }
    //避免循环依赖死循环
    let contents = {};
    try{
      if(!this.code) {
        // this.filename = EdithModule._resolveFilename(this.request, this.parent, this.node_modules_path);
        this.code = fs.readFileSync(this.filename, 'utf-8');
        // console.log(path.join('/node_modules', this.filename.replace(this.node_modules_path, '')))
        this.children = EdithModule._getChilrenList(this.code);
      }
      this.isLoad = true
      await Promise.all((this.children.map(async (filePath) => {
        const childrenModule = await getModule(filePath, this, this.node_modules_path);
        if(childrenModule) {
          const childrenContents = await childrenModule.getContents();
          contents = {
            ...contents,
            ...childrenContents
          }
        }
      })))
      contents[path.join('/node_modules', this.filename.replace(this.node_modules_path, ''))] = {
        content: this.code,
        require: this.children
      }
    } catch(error) {
      console.log(error)
      console.log(this.filename)
    }
    return contents;
  }
  static _getChilrenList(code: string): Array<any> {
    const ast = babelTemplate(code);
    console.log(ast)
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
  static _resolveFilename(request, parent: EdithModule | null, node_modules_path): string {
    const paths = [ parent ? parent.filename : ''];
    const parentPath = paths[0];
    let basePath = parentPath ? resolve(parentPath, request) : request;
    let filename;
    const exts = Object.keys(EdithModule._extensions);
    if(!path.isAbsolute(basePath)) {
      basePath = path.join(node_modules_path, basePath);
    }
    //判断需要模块路径是否以/结尾
    if(!basePath.match(/\/$/)) {
      const rc = EdithModule._stat(basePath);
      if(rc === 0) { //file
        filename = basePath;
      } else if(rc === 1) { //directory
        filename = EdithModule._tryPackage(basePath, exts);
      }
      if(!filename) {
        filename = EdithModule._tryExtensions(basePath, exts)
      }
    }
    if (!filename) {
      // console.log(basePath)
      filename = EdithModule._tryPackage(basePath, exts);
    }
    if (!filename) {
      // try it with each of the extensions at "index"
      filename = EdithModule._tryExtensions(resolve(basePath, 'index'), exts);
    }
    if(!filename) {
      filename = EdithModule._tryPackage(path.join(node_modules_path, request), exts);
    }
    return filename;
  }
  static _tryExtensions(p: string, exts: Array<string>): string {
    for (var i = 0, EL = exts.length; i < EL; i++) {
      var filename = EdithModule._tryFile(p + exts[i]);
      if (filename) {
        return filename;
      }
    }
    return '';
  }
  static _tryFile(requestPath) {
    const rc =  EdithModule._stat(requestPath);
    return rc === 0 && requestPath;
  }
  static _tryPackage(requestPath: string, exts: Array<string>) {
    var pkg = readPackage(requestPath);
    if (!pkg) return false;
    var filename = resolve(requestPath, pkg);
    return EdithModule._tryFile(filename) || EdithModule._tryExtensions(filename, exts) || EdithModule._tryExtensions(resolve(filename, 'index'), exts);
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
      const result = stat.isDirectory() ? 1 : 0;
      if (cache !== null) cache.set(filename, result);
      return result
    } catch(error) {
      return -1
    }
  }
}
for(var i = 0; i < numCPUs; i++) {
  const worker = fork(path.resolve(__dirname, './getContent.worker.js'));
  EdithModule.workers.push(worker);
  EdithModule.freeWorkers.push(worker);
}
console.log(`numCPUs:${numCPUs}`)
async function getModule(request: string, parent: EdithModule | null, node_modules_path: string = '/node_modules'): Promise<EdithModule | null> {
  const parentFileName = parent ? parent.filename : '';
  const id = path.join(node_modules_path, parentFileName || '', request);
  let filename: any = null;
  if(cachePaths[id]) {
    filename = cachePaths[id];
  } else {
    filename = await new Promise((resolve) => [
      pushTaskToQueue(path.join(request, parentFileName), {
        request,
        parentFileName,
        node_modules_path
      }, function(err, data) {
        if(!err) {
          resolve(data.filename);
        } else {
          resolve('')
        }
      })
    ])
    cachePaths[id] = filename
  }
  if(filename) {
    if(EdithModule._cache[filename]) {
      return EdithModule._cache[filename];
    }
    return new EdithModule(request, parent, node_modules_path, filename);
  }
  return null;
  // console.log(request, filename)
  // const filename = EdithModule._resolveFilename(request, parent, node_modules_path)
  // if(EdithModule._cache[filename]) {
  //   return EdithModule._cache[filename]
  // }
  
}
function executeTask({ data, callbacks}, worker: any) {
  worker._events.message = async (data) => {
    const { payload, type, error } = data;
    if (type === 'success') {
      callbacks.forEach(callback => callback(error, payload));
    }
    if(data.type === 'error') {
        callbacks.forEach(callback => callback(error));
    }
    if (type === 'error' || type === 'success') {
      EdithModule.freeWorkers.unshift(worker);
      translateRemainingTasks();
    }
  }
  // worker.on('message', async (data) => {
  //   const { payload, type, error } = data;
  //   if (type === 'success') {
  //     callbacks.forEach(callback => callback(error, payload));
  //   }
  //   if(data.type === 'error') {
  //       callbacks.forEach(callback => callback(error));
  //   }
  //   if (type === 'error' || type === 'success') {
  //     EdithModule.freeWorkers.unshift(worker);
  //     translateRemainingTasks();
  //   }
  // })
  worker.send({ type: 'resolve-filename', payload: data });
}
async function pushTaskToQueue(request: string, data: any, callback) {
  if(!EdithModule.taskQueue[request]) {
    EdithModule.taskQueue[request] = {
        data,
        callbacks: []
    }
  }
  EdithModule.taskQueue[request].callbacks.push(callback);
  translateRemainingTasks();
}
function translateRemainingTasks() {
  const taskIds = Object.keys(EdithModule.taskQueue)
  while (EdithModule.freeWorkers.length > 0 && taskIds.length > 0) {
    const taskId = taskIds.shift();
    if(taskId) {
      const task = EdithModule.taskQueue[taskId];
      delete EdithModule.taskQueue[taskId];
      const worker = EdithModule.freeWorkers.shift();
      if(worker) {
        executeTask(task, worker);
      }
    }
  }
}
export default getModule;
