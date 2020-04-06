import { Service } from 'egg';
const glob = require('glob')
const path = require('path');
const fs = require('fs')
// import fs from 'fs'

const PROJECT_PATH = 'projects';
export default class FileSystem extends Service {
    public projectBasePath: string;
    constructor(options){
        super(options);
        this.projectBasePath = path.join(this.app.baseDir, `${PROJECT_PATH}/`);
    }
    async getFileList(directory, parentPath = '') {
        const basePath = path.join(this.projectBasePath, directory);
        let globFileList = glob.sync(path.join(basePath, '*'));
        globFileList = globFileList.map(file => {
            const filename = path.relative(basePath, file);
            return {
                name: filename,
                path: parentPath ? `${parentPath}/${filename}` : filename
            }
        })
        for (let i = 0; i < globFileList.length; i++) {
            if(fs.statSync(path.join(basePath, globFileList[i].name)).isDirectory()) {
                globFileList[i].children = await this.getFileList(path.join(directory, globFileList[i].name), globFileList[i].path);
            } else {
                globFileList[i].value = await this.getFileInfo(path.join(basePath, globFileList[i].name))
            }
        }
        return globFileList
    }
    async getFileInfo(filename) {
        return fs.readFileSync(filename, { encoding: 'utf-8'});
    }
}