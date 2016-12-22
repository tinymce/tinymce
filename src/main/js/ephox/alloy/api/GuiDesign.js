define(
  'ephox.alloy.api.GuiDesign',

  [
    'ephox.highway.Merger'
  ],

  function (Merger) {
    // TODO: Consider using this.
    var use = function (design, spec) {
      return Merger.deepMerge(design, spec);
    };

    return {
      use: use
    };
  }
);