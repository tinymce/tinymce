define(
  'ephox.alloy.dropdown.Gamma',

  [
    'ephox.highway.Merger',
    'ephox.peanut.Fun'
  ],

  function (Merger, Fun) {
    var parts = [
      'display'
    ];

    var factories = {
      '<alloy.dropdown.display>': function (dSpec, detail) {
        return Merger.deepMerge(detail.parts().display(), {
          uiType: 'custom',
          dom: dSpec.extra.dom,
          components: dSpec.extra.components,
          uid: detail.partUids().display
        });
      }
    };

    return {
      parts: Fun.constant(parts),
      display: Fun.constant(factories)
    };
  }
);