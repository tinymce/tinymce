define(
  'ephox.darwin.mouse.CellSelection',

  [
    'ephox.compass.Arr',
    'ephox.darwin.style.Styles',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.robin.api.dom.DomParent',
    'ephox.sugar.api.Class',
    'ephox.sugar.api.Compare',
    'ephox.sugar.api.SelectorFilter',
    'ephox.sugar.api.SelectorFind',
    'global!Math'
  ],

  function (Arr, Styles, Fun, Option, DomParent, Class, Compare, SelectorFilter, SelectorFind, Math) {
    var selected = Styles.resolve('selected');

    var clear = function (container) {
      var sels = SelectorFilter.descendants(container, '.' + selected);
      Arr.each(sels, function (sel) {
        Class.remove(sel, selected);
      });
    };

    var select = function (cells) {
      Arr.each(cells, function (cell) {
        Class.add(cell, selected);
      });
    };

    var lookupTable = function (container) {
      return SelectorFind.ancestor(container, 'table');
    };

    var identify = function (start, finish) {
      // So ignore the colspan, rowspan for the time being.
      return DomParent.sharedOne(lookupTable, [ start, finish ]).bind(function (tbl) {
        // For all the rows, identify the information.
        var rows = SelectorFilter.descendants(tbl, 'tr');
        return findInTable(tbl, start).bind(function (startData) {
          return findInTable(tbl, finish).map(function (finishData) {
            var minRowIndex = Math.min(startData.rowIndex(), finishData.rowIndex());
            var maxRowIndex = Math.max(startData.rowIndex(), finishData.rowIndex());
            var subrows = rows.slice(minRowIndex, maxRowIndex + 1);
            return Arr.bind(subrows, function (r) {
              var cells = SelectorFilter.children(r, 'td,th');
              var minCellIndex = Math.min(startData.colIndex(), finishData.colIndex());
              var maxCellIndex = Math.max(startData.colIndex(), finishData.colIndex());
              return cells.slice(minCellIndex, maxCellIndex + 1);
            });
          });
        });
      });
    };

    var findInTable = function (container, cell) {
      return findColumn(cell).bind(function (colIndex) {
        return findRow(cell).map(function (rowIndex) {
          return {
            rowIndex: Fun.constant(rowIndex),
            colIndex: Fun.constant(colIndex),
          };
        });
      });
    };

    var findColumn = function (cell) {
      return SelectorFind.ancestor(cell, 'tr').bind(function (tr) {
        var cells = SelectorFilter.descendants(tr, 'td,th');
        var isElem = Fun.curry(Compare.eq, cell);
        var index = Arr.findIndex(cells, isElem);
        return index !== -1 ? Option.some(index) : Option.none();
      });
    };

    var findRow = function (cell) {
      return SelectorFind.ancestor(cell, 'tbody,thead').bind(function (section) {
        return SelectorFind.ancestor(cell, 'tr').bind(function (row) {
          var rows = SelectorFilter.descendants(section, 'tr');
          var isRow = Fun.curry(Compare.eq, row);
          var index = Arr.findIndex(rows, isRow);
          return index !== -1 ? Option.some(index) : Option.none();
        });
      });
    };

    return {
      clear: clear,
      select: select,
      identify: identify
    };
  }
);