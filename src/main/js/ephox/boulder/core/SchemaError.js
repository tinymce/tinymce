define(
  'ephox.boulder.core.SchemaError',

  [
    'ephox.numerosity.api.JSON',
    'ephox.perhaps.Result'
  ],

  function (Json, Result) {
    var nu = function (path, getErrorInfo) {
      return Result.error([{
        path: path,
        // This is lazy so that it isn't calculated unnecessarily
        getErrorInfo: getErrorInfo
      }]);
    };

    var missingStrict = function (path, key, obj) {
      return nu(path, function () {
        return 'Could not find valid *strict* value for "' + key + '" in ' + Json.stringify(obj, null, 2);
      });
    };

    var missingKey = function (path, key) {
      return nu(path, function () {
        return 'Choice schema did not contain choice key: "' + key + '"'
      });
    };

    var missingBranch = function (path, branches, branch) {
      return nu(path, function () {
        return 'The chosen schema: "' + branch + '" did not exist in branches: ' + Json.stringify(branches, null, 2)
      });
    };

    var custom = function (path, err) {
      return nu(path, function () { return err; });
    };

    var toString = function (error) {
      return 'Failed path: ('  + error.path.join(' > ') + ')\n' + error.getErrorInfo();
    };

    return {
      missingStrict: missingStrict,
      missingKey: missingKey,
      missingBranch: missingBranch,
      custom: custom,
      toString: toString
    };
  }
);