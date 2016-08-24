define(
  'ephox.katamari.api.LazyValue',

  [
    'ephox.katamari.api.Option'
  ],

  function (Option) {
    var nu = function (value) {
      var data = Option.none();
      var callbacks = [];

      var map = function (f) {
        return nu(function (nCallback) {
          get(function (data) {
            nCallback(f(data));
          });
        });
      };

      var get = function () {

      };

      var isReady = function () {

      };

      return {
        map: map,
        get: get
      };
    };

    return nu;
  }
);