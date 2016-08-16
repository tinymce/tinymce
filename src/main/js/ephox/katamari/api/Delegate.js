define(
  'ephox.katamari.api.Delegate',

  [
    'ephox.katamari.api.Global',
    'ephox.katamari.api.Resolve'
  ],

  function (Global, Resolve) {
    var delegate = function (path, scope) {
      return function () {
        var fn = Resolve.resolve(path, scope);
        return fn.apply(null, arguments);
      };
    };

    var delegateThunk = function (path, scope) {
      return function () {
        var fn = Resolve.resolve(path, (scope && scope()) || Global);
        return fn.apply(null, arguments);
      };
    };

    return {
      delegate: delegate,
      delegateThunk: delegateThunk
    };
  }
);

