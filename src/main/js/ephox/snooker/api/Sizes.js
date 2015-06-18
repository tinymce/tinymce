define(
  'ephox.snooker.api.Sizes',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.snooker.resize.Adjustments',
    'ephox.snooker.resize.Redistribution',
    'ephox.snooker.resize.Sizes',
    'ephox.snooker.util.CellUtils',
    'ephox.sugar.api.Css',
    'ephox.sugar.api.Width'
  ],

  function (Arr, Fun, Adjustments, Redistribution, Sizes, CellUtils, Css, Width) {
    var setWidth = function (cell, amount) {
     Sizes.setWidth(cell, amount);
    };

    var getWidth = function (cell) {
      return Sizes.getWidth(cell);
    };

    var redistributeWidth = function (table, newWidth, direction) {
      var totalWidth = Width.get(table);
      
      var unit = Redistribution.validate(newWidth).fold(Fun.constant('px'), Fun.constant('px'), Fun.constant('%'));
      var calculation = Adjustments.calculateWidths(table, direction);
      
      var output = Redistribution.redistribute(calculation.widths(), totalWidth, newWidth);
      Arr.each(calculation.cells(), function (cell) {
        var slice = output.slice(cell.column(), cell.colspan() + cell.column());
        var w = Redistribution.sum(slice, CellUtils.minWidth());
        Css.set(cell.element(), 'width', w + unit);
      });
    };

    return {
      setWidth: setWidth,
      getWidth: getWidth,
      redistributeWidth: redistributeWidth
    };
  }
);
