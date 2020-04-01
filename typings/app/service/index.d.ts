// This file is created by egg-ts-helper@1.25.7
// Do not modify this file!!!!!!!!!

import 'egg';
type AnyClass = new (...args: any[]) => any;
type AnyFunc<T = any> = (...args: any[]) => T;
type CanExportFunc = AnyFunc<Promise<any>> | AnyFunc<IterableIterator<any>>;
type AutoInstanceType<T, U = T extends CanExportFunc ? T : T extends AnyFunc ? ReturnType<T> : T> = U extends AnyClass ? InstanceType<U> : U;
import ExportComponent from '../../../app/service/component';
import ExportPackage from '../../../app/service/package';

declare module 'egg' {
  interface IService {
    component: AutoInstanceType<typeof ExportComponent>;
    package: AutoInstanceType<typeof ExportPackage>;
  }
}
