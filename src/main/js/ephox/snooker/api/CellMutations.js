define(
  'ephox.snooker.api.CellMutations',

  [
    'ephox.snooker.resize.Sizes'
  ],

  function (Sizes) {
    var halve = function (main, other) {
      var width = Sizes.getGenericWidth(main);
      width.each(function (width) {
        var newWidth = width.width() / 2;
        Sizes.setGenericWidth(main, newWidth, width.unit());
        Sizes.setGenericWidth(other, newWidth, width.unit());
      });
    };

    return {
      halve: halve
    };
  }
);
