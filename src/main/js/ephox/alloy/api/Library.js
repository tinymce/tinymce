define(
  'ephox.alloy.api.Library',

  [
    'ephox.alloy.api.Library',
    'ephox.highway.Merger'
  ],

  function (Library, Merger) {
    var combine = function (lib1, lib2) {
      return nu(lib1.get(), lib2.get());
    };

    var nu = function (factories) {
      var get = function () {
        return Merger.deepMerge(factories, { });
      };

      var build = function (factory, )
    }
    var self = function (factories) {
      var merge = function (others) {
        return self(
          Merger.deepMerge(factories, others)
        );
      };


    };

    return self;
  }
);