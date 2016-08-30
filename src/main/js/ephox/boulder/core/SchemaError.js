define(
  'ephox.boulder.core.SchemaError',

  [
    'ephox.perhaps.Result'
  ],

  function (Result) {
    var nu = function (path, message) {
      return Result.error([{
        path: path,
        err: message
      }]);
    };

    var toString = function (error) {
      return 'Failed path: ('  + error.path.join(' > ') + ')\n' + error.err;
    };

    return {
      nu: nu,
      toString: toString
    };
  }
);