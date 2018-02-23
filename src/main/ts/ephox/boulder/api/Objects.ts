import { ResultCombine } from '../combine/ResultCombine';
import { ObjChanger } from '../core/ObjChanger';
import { ObjReader } from '../core/ObjReader';
import { ObjWriter } from '../core/ObjWriter';
import { Option } from '@ephox/katamari';

// Perhaps this level of indirection is unnecessary.
const narrow = function (obj, fields) {
  return ObjChanger.narrow(obj, fields);
};

const exclude = function (obj, fields) {
  return ObjChanger.exclude(obj, fields);
};

const readOpt = function (key) {
  return ObjReader.readOpt(key);
};

const readOr = function (key, fallback) {
  return ObjReader.readOr(key, fallback);
};

const readOptFrom = function (obj, key) {
  return ObjReader.readOptFrom(obj, key);
};

const wrap = function (key, value) {
  return ObjWriter.wrap(key, value);
};

const wrapAll = function (keyvalues) {
  return ObjWriter.wrapAll(keyvalues);
};

const indexOnKey = function (array, key) {
  return ObjChanger.indexOnKey(array, key);
};

const consolidate = function (objs, base) {
  return ResultCombine.consolidateObj(objs, base);
};

const hasKey = function (obj, key) {
  return ObjReader.hasKey(obj, key);
};

export const Objects = {
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