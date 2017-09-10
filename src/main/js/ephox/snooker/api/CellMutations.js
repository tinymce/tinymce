define(
  'ephox.snooker.api.CellMutations',

  [
    'ephox.snooker.api.Sizes'
  ],

  function (Sizes) {
    var halve = function (main, other) {
      var width = Sizes.getWidth(main);
      Sizes.setWidth(main, width/2);
      Sizes.setWidth(other, width/2);
    };

    return {
      halve: halve
    };
  }
);
