define(
  'ephox.snooker.api.Sizes',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.snooker.model.DetailsList',
    'ephox.snooker.model.Warehouse',
    'ephox.snooker.resize.ColumnWidths',
    'ephox.snooker.resize.Redistribution',
    'ephox.snooker.resize.Sizes',
    'ephox.snooker.util.CellUtils',
    'ephox.sugar.api.Css',
    'ephox.sugar.api.Width'
  ],

  function (Arr, Fun, DetailsList, Warehouse, ColumnWidths, Redistribution, Sizes, CellUtils, Css, Width) {
    var setWidth = function (cell, amount) {
     Sizes.setWidth(cell, amount);
    };

    var getWidth = function (cell) {
      return Sizes.getWidth(cell);
    };

    var redistributeTo = function (newWidths, cells, unit) {
      Arr.each(cells, function (cell) {
        var widths = newWidths.slice(cell.column(), cell.colspan() + cell.column());
        var w = Redistribution.sum(widths, CellUtils.minWidth());
        Css.set(cell.element(), 'width', w + unit);
      });
    };

    var redistributeWidth = function (table, newWidth, direction) {
      var totalWidth = Width.get(table);
      var unit = Redistribution.validate(newWidth).fold(Fun.constant('px'), Fun.constant('px'), Fun.constant('%'));
      
      var list = DetailsList.fromTable(table);
      var warehouse = Warehouse.generate(list);
      var oldWidths = ColumnWidths.getRawWidths(warehouse, direction);
      var newWidths = Redistribution.redistribute(oldWidths, totalWidth, newWidth);
      console.log('oldWidths: ', oldWidths, 'newWidths', newWidths);

      var cells = Warehouse.justCells(warehouse);
      redistributeTo(newWidths, cells, unit);
    };

    return {
      setWidth: setWidth,
      getWidth: getWidth,
      redistributeWidth: redistributeWidth
    };
  }
);
