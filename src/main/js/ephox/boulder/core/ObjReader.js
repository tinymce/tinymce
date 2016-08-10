define(
  'ephox.boulder.core.ObjReader',

  [
    'ephox.perhaps.Option'
  ],

  function (Option) {
    var readOpt = function (key) {
      return function (obj) {
        return obj.hasOwnProperty(key) ? Option.from(obj[key]) : Option.none();
      };
    };

    var readOr = function (key, fallback) {
      return function (obj) {
        return readOpt(key)(obj).getOr(fallback);
      };
    };

    var readOptFrom = function (obj, key) {
      return readOpt(key)(obj);
    };

    return {
      readOpt: readOpt,
      readOr: readOr,
      readOptFrom: readOptFrom
    };
  }
);