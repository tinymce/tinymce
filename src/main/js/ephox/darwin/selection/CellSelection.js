define(
  'ephox.darwin.selection.CellSelection',

  [
    'ephox.compass.Arr',
    'ephox.darwin.navigation.CellFinder',
    'ephox.darwin.style.Styles',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.robin.api.dom.DomParent',
    'ephox.sugar.api.Class',
    'ephox.sugar.api.SelectorFilter',
    'ephox.sugar.api.SelectorFind',
    'global!Math'
  ],

  function (Arr, CellFinder, Styles, Fun, Option, DomParent, Class, SelectorFilter, SelectorFind, Math) {
    var selected = Styles.resolve('selected');
    var lastSelected = Styles.resolve('last-selected');
    var firstSelected = Styles.resolve('first-selected');

    var clear = function (container) {
      var sels = SelectorFilter.descendants(container, '.' + selected);
      Arr.each(sels, function (sel) {
        Class.remove(sel, selected);
        Class.remove(sel, lastSelected);
        Class.remove(sel, firstSelected);
      });
    };

    var select = function (cells) {
      Arr.each(cells, function (cell) {
        Class.add(cell, selected);
      });
    };

    var lookupTable = function (container) {
      return SelectorFind.ancestor(container, 'tbody,thead');
    };

    var identify = function (start, finish) {
      console.log('identifying: ', start.dom(), finish.dom());
      // So ignore the colspan, rowspan for the time being.
      return DomParent.sharedOne(lookupTable, [ start, finish ]).bind(function (tbl) {
        // For all the rows, identify the information.
        var rows = SelectorFilter.descendants(tbl, 'tr');
        return CellFinder.findInTable(start).bind(function (startData) {
          return CellFinder.findInTable(finish).map(function (finishData) {
            var minRowIndex = Math.min(startData.rowIndex(), finishData.rowIndex());
            var maxRowIndex = Math.max(startData.rowIndex(), finishData.rowIndex());
            console.log('minRow', minRowIndex, 'maxRow', maxRowIndex, start.dom(), finish.dom());
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

    var retrieve = function (container) {
      var sels = SelectorFilter.descendants(container, '.' + selected);
      return sels.length > 0 ? Option.some(sels) : Option.none();
    };

    var getLast = function (boxes) {
      var raw = Arr.find(boxes, function (box) {
        return Class.has(box, lastSelected);
      });
      return Option.from(raw);
    };

    var expandTo = function (finish) {
      return SelectorFind.ancestor(finish, 'table').bind(function (table) {
        return SelectorFind.descendant(table, '.' + firstSelected).bind(function (start) {
          return identify(start, finish).map(function (boxes) {
            return {
              boxes: Fun.constant(boxes),
              start: Fun.constant(start),
              finish: Fun.constant(finish)
            };
          });
        });
      });
    };

    var shiftSelection = function (boxes, deltaRow, deltaColumn) {
      return getLast(boxes).bind(CellFinder.findInTable).bind(function (position) {
        return SelectorFind.ancestor(boxes[0], 'tbody,thead').bind(function (table) {
          return CellFinder.gotoCell(table, position.rowIndex() + deltaRow, position.colIndex() + deltaColumn).bind(expandTo);
        });
      });
    };

    var selectRange = function (container, cells, start, finish) {
      clear(container);
      select(cells);
      Class.add(start, firstSelected);
      Class.add(finish, lastSelected);
    };

    return {
      clear: clear,
      identify: identify,
      retrieve: retrieve,
      shiftSelection: shiftSelection,
      selectRange: selectRange
    };
  }
);