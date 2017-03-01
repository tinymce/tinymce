define(
  'ephox.alloy.debugging.Debugging',

  [
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Fun',
    'global!console',
    'global!Error'
  ],

  function (Arr, Fun, console, Error) {
    var unknown = 'unknown';
    var debugging = true;

    // Ignore these files in the error stack
    var path = [
      'alloy/data/Fields',
      'alloy/debugging/Debugging'
    ]

    var getTrace = function () {
      if (debugging === false) return unknown;
      var err = new Error();
      if (err.stack !== undefined) {
        var lines = err.stack.split('\n');
        return Arr.find(lines, function (line) {
          return line.indexOf('alloy') > 0 && !Arr.exists(path, function (p) { return line.indexOf(p) > -1; });
        }).getOr(unknown);
      } else {
        return unknown;
      }
    };

    var logHandler = function (label, handlerName, trace) {
      if (debugging) console.log(label + ' [' + handlerName + ']', trace);
    };

    return {
      logHandler: logHandler,
      getTrace: getTrace,
      isDebugging: Fun.constant(debugging)
    };
  }
);
