define(
  'ephox.snooker.api.Sizes',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.snooker.model.DetailsList',
    'ephox.snooker.model.Warehouse',
    'ephox.snooker.resize.BarPositions',
    'ephox.snooker.resize.ColumnSizes',
    'ephox.snooker.resize.Redistribution',
    'ephox.snooker.resize.Sizes',
    'ephox.snooker.util.CellUtils',
    'ephox.sugar.api.Css',
    'ephox.sugar.api.Height',
    'ephox.sugar.api.Width'
  ],

  function (Arr, Fun, DetailsList, Warehouse, BarPositions, ColumnSizes, Redistribution, Sizes, CellUtils, Css, Height, Width) {
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

    var redistribute = function (table, nuSize, direction, getter, sizeGet) {
      var total = getter(table);
      var unit = Redistribution.validate(nuSize).fold(Fun.constant('px'), Fun.constant('px'), Fun.constant('%'));

      var list = DetailsList.fromTable(table);
      var warehouse = Warehouse.generate(list);
      var oldSizes = sizeGet(warehouse, direction);
      var nuSizes = Redistribution.redistribute(oldSizes, total, nuSize);
      var cells = Warehouse.justCells(warehouse);

      return {
        newSizes: nuSizes,
        cells: cells,
        unit: unit,
        warehouse: warehouse
      };
    };

    var redistributeHeight = function (table, newHeight) {
      var calcs = redistribute(table, newHeight, BarPositions.height, Height.get, ColumnSizes.getRawHeights);
      var rows = calcs.warehouse.all();
      redistributeToH(calcs.newSizes, rows, calcs.cells, calcs.unit);
    };

    var redistributeWidth = function (table, newWidth, direction) {
      var calcs = redistribute(table, newWidth, direction, Width.get, ColumnSizes.getRawWidths);
      redistributeToW(calcs.newSizes, calcs.cells, calcs.unit);
    };

    return {
      setWidth: Sizes.setWidth,
      getWidth: Sizes.getWidth,
      setHeight: Sizes.setHeight,
      getHeight: Sizes.getHeight,
      redistributeWidth: redistributeWidth,
      redistributeHeight: redistributeHeight
    };
  }
);
