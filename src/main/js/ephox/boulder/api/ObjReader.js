define(
  'ephox.boulder.api.ObjReader',

  [
    'ephox.perhaps.Option'
  ],

  function (Option) {
    var readOpt = function (key) {
      return function (obj) {
        return Option.from(obj[key]);
      };
    };

    var readOr = function (key, fallback) {
      return function (obj) {
        return read(key)(obj).getOr(fallback);
      };
    };

    var readFrom = function (obj, key) {
      return read(key)(obj);
    };

    return {
      readOpt: readOpt,
      readOr: readOr,
      readFrom: readFrom
    };
  }
);