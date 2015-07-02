define(
  'ephox.snooker.api.Sizes',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.snooker.model.DetailsList',
    'ephox.snooker.model.Warehouse',
    'ephox.snooker.resize.ColumnSizes',
    'ephox.snooker.resize.Redistribution',
    'ephox.snooker.resize.Sizes',
    'ephox.snooker.util.CellUtils',
    'ephox.sugar.api.Css',
    'ephox.sugar.api.Height',
    'ephox.sugar.api.Width'
  ],

  function (Arr, Fun, DetailsList, Warehouse, ColumnSizes, Redistribution, Sizes, CellUtils, Css, Height, Width) {
    var setWidth = function (cell, amount) {
      Sizes.setWidth(cell, amount);
    };

    var getWidth = function (cell) {
      return Sizes.getWidth(cell);
    };

    var setHeight = function (cell, amount) {
      Sizes.setHeight(cell, amount);
    };

    var getHeight = function (cell) {
      return Sizes.getHeight(cell);
    };

    var redistributeToW = function (newWidths, cells, unit) {
      Arr.each(cells, function (cell) {
        var widths = newWidths.slice(cell.column(), cell.colspan() + cell.column());
        var w = Redistribution.sum(widths, CellUtils.minWidth());
        Css.set(cell.element(), 'width', w + unit);
      });
    };

    var redistributeToH = function (newHeights, rows, cells, unit) {
      Arr.each(cells, function (cell) {
        var heights = newHeights.slice(cell.row(), cell.rowspan() + cell.row());
        var h = Redistribution.sum(heights, CellUtils.minHeight());
        Css.set(cell.element(), 'height', h + unit);
      });

      Arr.each(rows, function (row, i) {
        Css.set(row.element(), 'height', newHeights[i]);
      });
    };

    var redistributeHeight = function (table, newHeight, direction) {
      var totalHeight = Height.get(table);
      var unit = Redistribution.validate(newHeight).fold(Fun.constant('px'), Fun.constant('px'), Fun.constant('%'));

      var list = DetailsList.fromTable(table);
      var warehouse = Warehouse.generate(list);
      var oldHeights = ColumnSizes.getRawHeights(warehouse, direction);
      var newHeights = Redistribution.redistribute(oldHeights, totalHeight, newHeight);
      var cells = Warehouse.justCells(warehouse);
      var rows = warehouse.all();
      redistributeToH(newHeights, rows, cells, unit);
    };


    var redistributeWidth = function (table, newWidth, direction) {
      var totalWidth = Width.get(table);
      var unit = Redistribution.validate(newWidth).fold(Fun.constant('px'), Fun.constant('px'), Fun.constant('%'));

      var list = DetailsList.fromTable(table);
      var warehouse = Warehouse.generate(list);
      var oldWidths = ColumnSizes.getRawWidths(warehouse, direction);
      var newWidths = Redistribution.redistribute(oldWidths, totalWidth, newWidth);

      var cells = Warehouse.justCells(warehouse);

      redistributeToW(newWidths, cells, unit);
    };

    return {
      setWidth: setWidth,
      getWidth: getWidth,
      setHeight: setHeight,
      getHeight: getHeight,
      redistributeWidth: redistributeWidth,
      redistributeHeight: redistributeHeight
    };
  }
);
