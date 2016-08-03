define(
  'ephox.boulder.api.Objects',

  [
    'ephox.boulder.core.ObjChanger',
    'ephox.boulder.core.ObjReader',
    'ephox.boulder.core.ObjWriter'
  ],

  function (ObjChanger, ObjReader, ObjWriter) {
    // Perhaps this level of indirection is unnecessary.
    var narrow = function (obj, fields) {
      return ObjChanger.narrow(obj, fields);
    };

    var readOpt = function (key) {
      return ObjReader.readOpt(key);
    };

    var readOrErr = function (key) {
      return ObjReader.readOrErr(key);
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

    return {
      narrow: narrow,
      readOpt: readOpt,
      readOrErr: readOrErr,
      readOr: readOr,
      readOptFrom: readOptFrom,
      wrap: wrap,
      wrapAll: wrapAll,
      indexOnKey: indexOnKey
    };
  }
);