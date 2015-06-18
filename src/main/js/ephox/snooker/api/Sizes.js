define(
  'ephox.snooker.api.Sizes',

  [
    'ephox.compass.Arr',
    'ephox.snooker.resize.Adjustments',
    'ephox.snooker.resize.Redistribution',
    'ephox.snooker.resize.Sizes',
    'ephox.snooker.util.CellUtils',
    'ephox.sugar.api.Css',
    'ephox.sugar.api.Width'
  ],

  function (Arr, Adjustments, Redistribution, Sizes, CellUtils, Css, Width) {
    var setWidth = function (cell, amount) {
     Sizes.setWidth(cell, amount);
    };

    var getWidth = function (cell) {
      return Sizes.getWidth(cell);
    };

    var redistributeWidth = function (table, newWidth, direction) {
      var totalWidth = Width.get(table);
      console.log('totalWidth', totalWidth);
      var callback = Adjustments.calculateWidths(table, direction);
      callback(function (widths, all) {
        var output = Redistribution.redistribute(widths, totalWidth, newWidth);

        Arr.each(all, function (cell) {
          var slice = output.slice(cell.column(), cell.colspan() + cell.column());
          var w = Redistribution.sum(slice, totalWidth, CellUtils.minWidth());
          Css.set(cell.element(), 'width', w);
        });
      });
    };

    return {
      setWidth: setWidth,
      getWidth: getWidth,
      redistributeWidth: redistributeWidth
    };
  }
);
