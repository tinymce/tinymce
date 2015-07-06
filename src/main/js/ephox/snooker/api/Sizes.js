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

    var getUnit = function (newSize) {
      return Redistribution.validate(newSize).fold(Fun.constant('px'), Fun.constant('px'), Fun.constant('%'));
    };


    var redistribute = function (table, optWidth, optHeight, direction) {
      var list = DetailsList.fromTable(table);
      var warehouse = Warehouse.generate(list);
      var rows = warehouse.all();
      var cells = Warehouse.justCells(warehouse);

      optWidth.each(function (newWidth) {
        var wUnit = getUnit(newWidth);
        var totalWidth = Width.get(table);
        var oldWidths = ColumnSizes.getRawWidths(warehouse, direction);
        var nuWidths = Redistribution.redistribute(oldWidths, totalWidth, newWidth);
        redistributeToW(nuWidths, cells, wUnit);
        Css.set(table, 'width', newWidth);
      });

      optHeight.each(function (newHeight) {
        var totalHeight = Height.get(table);
        var hUnit = getUnit(newHeight);
        var oldHeights = ColumnSizes.getRawHeights(warehouse, BarPositions.height);
        var nuHeights = Redistribution.redistribute(oldHeights, totalHeight, newHeight);
        redistributeToH(nuHeights, rows, cells, hUnit);
        Css.set(table, 'height', newHeight);
      });

    };

    return {
      setWidth: Sizes.setWidth,
      getWidth: Sizes.getWidth,
      setHeight: Sizes.setHeight,
      getHeight: Sizes.getHeight,
      redistribute: redistribute
    };
  }
);
