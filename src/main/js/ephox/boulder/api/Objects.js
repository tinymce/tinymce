define(
  'ephox.boulder.api.Objects',

  [
    'ephox.boulder.combine.ResultCombine',
    'ephox.boulder.core.ObjChanger',
    'ephox.boulder.core.ObjReader',
    'ephox.boulder.core.ObjWriter'
  ],

  function (ResultCombine, ObjChanger, ObjReader, ObjWriter) {
    // Perhaps this level of indirection is unnecessary.
    var narrow = function (obj, fields) {
      return ObjChanger.narrow(obj, fields);
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

    return {
      narrow: narrow,
      readOpt: readOpt,
      readOr: readOr,
      readOptFrom: readOptFrom,
      wrap: wrap,
      wrapAll: wrapAll,
      indexOnKey: indexOnKey,
      consolidate: consolidate
    };
  }
);