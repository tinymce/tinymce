define(
  'ephox.boulder.api.ObjReader',

  [
    'ephox.numerosity.api.JSON',
    'ephox.perhaps.Option',
    'ephox.perhaps.Result'
  ],

  function (Json, Option, Result) {
    var readOpt = function (key) {
      return function (obj) {
        return Option.from(obj[key]);
      };
    };

    var readOrErr = function (key) {
      return function (obj) {
        if (obj[key] !== undefined) return Result.value(obj[key]);
        else return Result.error('Key: ' + key + ' is not in ' + Json.stringify(obj, null, 2));
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
      readOrErr: readOrErr,
      readOptFrom: readOptFrom
    };
  }
);