define(
  'ephox.alloy.debugging.StackTrace',

  [
    'ephox.katamari.api.Arr',
    'global!Error'
  ],

  function (Arr, Error) {
    var unknown = 'unknown';

    var get = function () {
      var err = new Error();
      if (err.stack !== undefined) {
        var lines = err.stack.split('\n');
        return Arr.find(lines, function (line) {
          return line.indexOf('alloy') > 0 && line.indexOf('alloy/data/Fields') === -1 && line.indexOf('alloy/debugging/StackTrace') === -1;
        }).getOr(unknown);
      } else {
        return unknown;
      }
    };

    return {
      get: get
    };
  }
);
