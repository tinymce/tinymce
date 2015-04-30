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
    'ephox.sugar.api.Traverse',
    'global!Math'
  ],

  function (Arr, Styles, Fun, Option, DomParent, Class, Compare, SelectorFilter, SelectorFind, Traverse, Math) {
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
      return SelectorFind.ancestor(container, 'table');
    };

    var identify = function (start, finish) {
      console.log('branching', start.dom(), finish.dom());
      // So ignore the colspan, rowspan for the time being.
      return DomParent.sharedOne(lookupTable, [ start, finish ]).bind(function (tbl) {
        // For all the rows, identify the information.
        var rows = SelectorFilter.descendants(tbl, 'tr');
        return findInTable(start).bind(function (startData) {
          return findInTable(finish).map(function (finishData) {
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

    var findInTable = function (cell) {
      console.log('locating', cell.dom());
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

    var gotoCell = function (table, rowIndex, colIndex) {
      var rows = SelectorFilter.descendants(table, 'tr');
      return Option.from(rows[rowIndex]).bind(function (row) {
        var cells = SelectorFilter.children(row, 'td,th');
        return Option.from(cells[colIndex]);
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

    var mogel = function (finish) {
      console.log('mogelling', finish.dom());
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
      console.log('shifting selection', deltaRow, deltaColumn);
      return getLast(boxes).bind(findInTable).bind(function (position) {
        console.log('found last', position);
        return SelectorFind.ancestor(boxes[0], 'table').bind(function (table) {
          console.log('found table');
          return gotoCell(table, position.rowIndex() + deltaRow, position.colIndex() + deltaColumn).bind(mogel);
        });
      });
    };

    var selectRange = function (container, cells, start, finish) {
      clear(container);
      select(cells);
      Class.add(start, firstSelected);
      Class.add(finish, lastSelected);
    };

    // var shiftDown = function (boxes) {
    //   // Assume that the last cell is the one to shift right.
    //   return getLast(boxes).bind(Traverse.prevSibling).bind(function (finish) {
    //     return Compare.eq(finish, boxes[0]) ? Traverse.prevSibling(finish) : Option.some(finish);
    //   }).bind(function (finish) {
    //     return identify(boxes[0], finish);
    //   });
    // };

    return {
      clear: clear,
      identify: identify,
      retrieve: retrieve,
      shiftSelection: shiftSelection,
      selectRange: selectRange
    };
  }
);