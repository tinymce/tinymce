define(
  'ephox.darwin.selection.CellSelection',

  [
    'ephox.compass.Arr',
    'ephox.darwin.api.Ephemera',
    'ephox.darwin.navigation.CellFinder',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.robin.api.dom.DomParent',
    'ephox.sugar.api.Class',
    'ephox.sugar.api.OnNode',
    'ephox.sugar.api.SelectorFilter',
    'ephox.sugar.api.SelectorFind',
    'global!Math'
  ],

  function (Arr, Ephemera, CellFinder, Fun, Option, DomParent, Class, OnNode, SelectorFilter, SelectorFind, Math) {
    var clear = function (container) {
      var sels = SelectorFilter.descendants(container, '.' + Ephemera.selectedClass());
      Arr.each(sels, OnNode.removeClasses([ Ephemera.selectedClass(), Ephemera.lastSelectedClass(), Ephemera.firstSelectedClass() ]));
    };

    var select = function (cells) {
      Arr.each(cells, OnNode.addClass(Ephemera.selectedClass()));
    };

    var lookupTable = function (container) {
      return SelectorFind.ancestor(container, 'table');
    };

    // Note, bIndex is not necessarily higher than aIndex
    var sliceInterval = function (xs, aIndex, bIndex) {
      var minRowIndex = Math.min(aIndex, bIndex);
      var maxRowIndex = Math.max(aIndex, bIndex);
      return xs.slice(minRowIndex, maxRowIndex + 1);
    };

    var identify = function (start, finish) {
      // So ignore the colspan, rowspan for the time being.
      return DomParent.sharedOne(lookupTable, [ start, finish ]).bind(function (tbl) {
        // For all the rows, identify the information.
        var rows = SelectorFilter.descendants(tbl, 'tr');
        return CellFinder.findInTable(start).bind(function (startData) {
          return CellFinder.findInTable(finish).map(function (finishData) {
            var subrows = sliceInterval(rows, startData.rowIndex(), finishData.rowIndex());
            return Arr.bind(subrows, function (r) {
              var cells = SelectorFilter.children(r, 'td,th');
              return sliceInterval(cells, startData.colIndex(), finishData.colIndex());
            });
          });
        });
      });
    };

    var retrieve = function (container) {
      var sels = SelectorFilter.descendants(container, '.' + Ephemera.selectedClass());
      return sels.length > 0 ? Option.some(sels) : Option.none();
    };

    var getLast = function (boxes) {
      var raw = Arr.find(boxes, OnNode.hasClass(Ephemera.lastSelectedClass()));
      return Option.from(raw);
    };

    var expandTo = function (finish) {
      return SelectorFind.ancestor(finish, 'table').bind(function (table) {
        return SelectorFind.descendant(table, '.' + Ephemera.firstSelectedClass()).bind(function (start) {
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
      return getLast(boxes).bind(function (last) {
        return CellFinder.avocado(last, deltaRow, deltaColumn).bind(expandTo);
        // return CellFinder.findInTable).bind(function (position) {
        // console.log('position: ', position.rowIndex(), position.colIndex());
        // return SelectorFind.ancestor(boxes[0], 'table').bind(function (table) {
        //   return CellFinder.gotoCell(table, position.rowIndex() + deltaRow, position.colIndex() + deltaColumn).bind(expandTo);
        // });
      });
    };

    var isSelected = function (cell) {
      return Class.has(cell, Ephemera.selectedClass());
    };

    var selectRange = function (container, cells, start, finish) {
      clear(container);
      select(cells);
      Class.add(start, Ephemera.firstSelectedClass());
      Class.add(finish, Ephemera.lastSelectedClass());
    };

    return {
      clear: clear,
      identify: identify,
      retrieve: retrieve,
      shiftSelection: shiftSelection,
      isSelected: isSelected,
      selectRange: selectRange
    };
  }
);