define(
  'ephox.alloy.spec.ContainerSpec',

  [
    'ephox.highway.Merger'
  ],

  function (Merger) {
    var make = function (spec) {
      // Maybe default some arguments here
      return Merger.deepMerge({
        dom: {
          tag: 'div'
        }
      }, spec, {
        uiType: 'custom'
      });
    };

    return {
      make: make
    };
  }
);