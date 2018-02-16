import ResultCombine from '../combine/ResultCombine';
import ObjChanger from '../core/ObjChanger';
import ObjReader from '../core/ObjReader';
import ObjWriter from '../core/ObjWriter';

// Perhaps this level of indirection is unnecessary.
var narrow = function (obj, fields) {
  return ObjChanger.narrow(obj, fields);
};

var exclude = function (obj, fields) {
  return ObjChanger.exclude(obj, fields);
};

var readOpt = function (key) {
  return ObjReader.readOpt(key);
};

var readOr = function (key, fallback) {
  return ObjReader.readOr(key, fallback);
};

var readOptFrom = function (obj, key) {
  return ObjReader.readOptFrom(obj, key);
};

var wrap = function (key, value) {
  return ObjWriter.wrap(key, value);
};

var wrapAll = function (keyvalues) {
  return ObjWriter.wrapAll(keyvalues);
};

var indexOnKey = function (array, key) {
  return ObjChanger.indexOnKey(array, key);
};

var consolidate = function (objs, base) {
  return ResultCombine.consolidateObj(objs, base);
};

var hasKey = function (obj, key) {
  return ObjReader.hasKey(obj, key);
};

export default <any> {
  narrow: narrow,
  exclude: exclude,
  readOpt: readOpt,
  readOr: readOr,
  readOptFrom: readOptFrom,
  wrap: wrap,
  wrapAll: wrapAll,
  indexOnKey: indexOnKey,
  hasKey: hasKey,
  consolidate: consolidate
};