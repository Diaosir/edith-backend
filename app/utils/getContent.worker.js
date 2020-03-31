
const path = require('path');
const fs = require('fs')
function resolve(requestPath, dest) {
  if(requestPath.match(/\.\w+$/)) {
    return path.resolve(path.dirname(requestPath), dest);
  } else {
    return path.resolve(requestPath, dest);
  }
}
function readPackage(requestPath) {
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
function _tryExtensions(p, exts = [], request) {
  for (var i = 0, EL = exts.length; i < EL; i++) {
    var filename = _tryFile(p + exts[i]);
    if (filename) {
      return filename;
    } else {
      // if(request === 'object-assign') {
      //   console.log(p + exts[i])
      // }
      // console.log(filename, p + exts[i])
    }
  }

  return '';
}
function _tryFile(requestPath) {
  const rc =  _stat(requestPath);
  return rc === 0 ? requestPath : '';
}
function _tryPackage(requestPath, exts = []) {
  var pkg = readPackage(requestPath);
  if (!pkg) return false;
  var filename = resolve(requestPath, pkg);
  return _tryFile(filename) || _tryExtensions(filename, exts) || _tryExtensions(resolve(filename, 'index'), exts);
}
function _stat(filename) {
  // const cache = statCache;
  // if (cache !== null) {
  //   const result = cache.get(filename);
  //   if (result !== undefined) return result;
  // }
  try {
    const stat = fs.statSync(path._makeLong(filename));
    const result = stat.isDirectory() ? 1 : 0;
    // if (cache !== null) cache.set(filename, result);
    return result
  } catch(error) {
    return -1
  }
}
function resolveFile(basePath, request) {
  let filename;
  const exts = ['.js', '.json'];
  //判断需要模块路径是否以/结尾
  if(!basePath.match(/\/$/)) {
    const rc = _stat(basePath);
    if(rc === 0) { //file
      filename = basePath;
    } else if(rc === 1) { //directory
      filename = _tryPackage(basePath, exts);
    }
    if(!filename) {
      filename = _tryExtensions(basePath, exts)
    }
  }
  if (!filename) {
    // console.log(basePath)
    filename = _tryPackage(basePath, exts);
  }
  if (!filename) {
    // try it with each of the extensions at "index"
    filename = _tryExtensions(resolve(basePath, 'index'), exts, request);
  }
  return filename;
}
function _resolveFilename(payload) {
  const {request, parentFileName, node_modules_path } = payload;
  const paths = [ parentFileName || ''];
  const parentPath = paths[0];
  let basePath = parentPath ? resolve(parentPath, request) : request;
  if(!path.isAbsolute(basePath)) {
    basePath = path.join(node_modules_path, basePath);
  }
  let filename = resolveFile(basePath, request);

  //查询上一级node_modules
  basePath = path.join(node_modules_path, request)
  if(!filename) {
    filename = resolveFile(basePath, request);
  }
  if(!filename) {
    console.log(`
requestPath: ${request}
basePath: ${basePath},
parentFileName: ${parentFileName}
    `)
  }
  return filename;
}
process.on('message', function (data) {
  const { type, payload } = data;
  if(type === 'resolve-filename') {
    const {request, parentFileName, node_modules_path } = payload;
    const id = path.join(node_modules_path, parentFileName || '', request);
    const filename =  _resolveFilename(payload);
    process.send({
      type: 'success',
      payload: {
        basePath: id,
        filename: filename
      }
    })
  }
})