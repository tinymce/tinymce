define(
  'ephox.darwin.selection.CellSelection',

  [
    'ephox.compass.Arr',
    'ephox.darwin.api.Ephemera',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.robin.api.dom.DomParent',
    'ephox.snooker.api.TablePositions',
    'ephox.sugar.api.Class',
    'ephox.sugar.api.OnNode',
    'ephox.sugar.api.SelectorFilter',
    'ephox.sugar.api.SelectorFind',
    'global!Math'
  ],

  function (Arr, Ephemera, Fun, Option, DomParent, TablePositions, Class, OnNode, SelectorFilter, SelectorFind, Math) {
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

    var identify = function (start, finish) {
      return DomParent.sharedOne(lookupTable, [ start, finish ]).bind(function (tbl) {
        return TablePositions.intercepts(tbl, start, finish);
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
        return TablePositions.moveBy(last, deltaRow, deltaColumn).bind(expandTo);
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