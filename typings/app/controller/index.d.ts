// This file is created by egg-ts-helper@1.25.7
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportComponent from '../../../app/controller/component';
import ExportPackage from '../../../app/controller/package';
import ExportProject from '../../../app/controller/project';
import ExportTopics from '../../../app/controller/topics';
import ExportTypings from '../../../app/controller/typings';

declare module 'egg' {
  interface IController {
    component: ExportComponent;
    package: ExportPackage;
    project: ExportProject;
    topics: ExportTopics;
    typings: ExportTypings;
  }
}
