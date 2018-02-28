import { ResultCombine } from '../combine/ResultCombine';
import * as ObjChanger from '../core/ObjChanger';
import * as ObjReader from '../core/ObjReader';
import * as ObjWriter from '../core/ObjWriter';
import { Option, Result } from '@ephox/katamari';

// Perhaps this level of indirection is unnecessary.
const narrow = function (obj: {}, fields: any[]): {} {
  return ObjChanger.narrow(obj, fields);
};

const exclude = function (obj: {}, fields: any[]): {} {
  return ObjChanger.exclude(obj, fields);
};

const readOpt = function <T>(key: string): ({}) => Option <T> {
  return ObjReader.readOpt(key);
};

const readOr = function (key: string, fallback: any): ({}) => any {
  return ObjReader.readOr(key, fallback);
};

const readOptFrom = function (obj: {}, key: string): Option<any> {
  return ObjReader.readOptFrom(obj, key);
};

const wrap = function (key: string, value: {}): {} {
  return ObjWriter.wrap(key, value);
};

const wrapAll = function (keyvalues: Array<{key: string; value: any}>): {} {
  return ObjWriter.wrapAll(keyvalues);
};

const indexOnKey = function <T> (array: [{[T: string]: any}], key: string): {[T: string]: any} {
  return ObjChanger.indexOnKey(array, key);
};

const consolidate = function (objs: [{}], base: {}): Result <{}, string> {
  return ResultCombine.consolidateObj(objs, base);
};

const hasKey = function (obj: {}, key: string): boolean {
  return ObjReader.hasKey(obj, key);
};

export {
  narrow,
  exclude,
  readOpt,
  readOr,
  readOptFrom,
  wrap,
  wrapAll,
  indexOnKey,
  hasKey,
  consolidate
};