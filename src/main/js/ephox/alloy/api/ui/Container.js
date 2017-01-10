define(
  'ephox.alloy.api.ui.Container',

  [
    'ephox.alloy.api.ui.UiBuilder',
    'ephox.highway.Merger'
  ],

  function (UiBuilder, Merger) {
    var make = function (_detail, spec) {
      return Merger.deepMerge({
        dom: {
          tag: 'div',
          attributes: {
            role: 'presentation'
          }
        }
      }, spec);
    };

    var build = function (spec) {
      return UiBuilder.single('Container', [ ], make, spec);
    };

    return {
      build: build
    };
  }
);