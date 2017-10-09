define(
  'ephox.snooker.api.CellMutations',

  [
    'ephox.snooker.api.Sizes'
  ],

  function (Sizes) {
    var halve = function (main, other) {
      var width = Sizes.getPixelWidth(main);
      Sizes.setPixelWidth(main, width/2);
      Sizes.setPixelWidth(other, width/2);
    };

    return {
      halve: halve
    };
  }
);
