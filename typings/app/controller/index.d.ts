// This file is created by egg-ts-helper@1.25.7
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportCombinations from '../../../app/controller/combinations';
import ExportTopics from '../../../app/controller/topics';
import ExportTypings from '../../../app/controller/typings';

declare module 'egg' {
  interface IController {
    combinations: ExportCombinations;
    topics: ExportTopics;
    typings: ExportTypings;
  }
}
