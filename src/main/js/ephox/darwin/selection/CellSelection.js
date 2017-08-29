define(
  'ephox.darwin.selection.CellSelection',

  [
    'ephox.compass.Arr',
    'ephox.darwin.api.Ephemera',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.robin.api.dom.DomParent',
    'ephox.snooker.api.TablePositions',
    'ephox.syrup.api.Compare',
    'ephox.syrup.api.OnNode',
    'ephox.syrup.api.SelectorFilter',
    'ephox.syrup.api.SelectorFind',
    'ephox.syrup.api.Selectors'
  ],

  function (Arr, Ephemera, Fun, Option, DomParent, TablePositions, Compare, OnNode, SelectorFilter, SelectorFind, Selectors) {
    // var selectedClass = '.' + Ephemera.selectedClass();
    // var addSelectionClass = OnNode.addClass(Ephemera.selectedClass());
    // var removeSelectionClasses = OnNode.removeClasses([ Ephemera.selectedClass(), Ephemera.lastSelectedClass(), Ephemera.firstSelectedClass() ]);

    // var clear = function (container) {
    //   var sels = SelectorFilter.descendants(container, selectedClass);
    //   Arr.each(sels, removeSelectionClasses);
    // };

    // var select = function (cells) {
    //   Arr.each(cells, addSelectionClass);
    // };

    var lookupTable = function (container, isRoot) {
      return SelectorFind.ancestor(container, 'table');
    };

    var identify = function (start, finish, isRoot) {
      // Optimisation: If the cells are equal, it's a single cell array
      if (Compare.eq(start, finish)) {
        return Option.some([ start ]);
      } else {
        return lookupTable(start, isRoot).bind(function (startTable) {
          return lookupTable(finish, isRoot).bind(function (finishTable) {
            if (Compare.eq(startTable, finishTable)) { // Selecting from within the same table.
              return TablePositions.intercepts(startTable, start, finish);
            } else if (Compare.contains(startTable, finishTable)) { // Selecting from the parent table to the nested table.
              return TablePositions.nestedIntercepts(startTable, start, startTable, finish, finishTable);
            } else if (Compare.contains(finishTable, startTable)) { // Selecting from the nested table to the parent table.
              return TablePositions.nestedIntercepts(finishTable, start, startTable, finish, finishTable);
            } else { // Selecting from a nested table to a different nested table.
              return DomParent.ancestors(start, finish).shared().bind(function (lca) {
                return SelectorFind.closest(lca, 'table', isRoot).bind(function (lcaTable) {
                  return TablePositions.nestedIntercepts(lcaTable, start, startTable, finish, finishTable);
                });
              });
            }
          });
        });
      }
    };

    var retrieve = function (container, selector) {
      var sels = SelectorFilter.descendants(container, selector);
      return sels.length > 0 ? Option.some(sels) : Option.none();
    };

    var getLast = function (boxes, lastSelectedSelector) {
      var raw = Arr.find(boxes, function (box) {
        return Selectors.is(box, lastSelectedSelector);
      });
      return Option.from(raw);
    };

    var getEdges = function (container, firstSelectedSelector, lastSelectedSelector) {
      return SelectorFind.descendant(container, firstSelectedSelector).bind(function (first) {
        return SelectorFind.descendant(container, lastSelectedSelector).bind(function (last) {
          return DomParent.sharedOne(lookupTable, [ first, last ]).map(function (tbl) {
            return {
              first: Fun.constant(first),
              last: Fun.constant(last),
              table: Fun.constant(tbl)
            };
          });
        });
      });
    };

    var expandTo = function (finish, firstSelectedSelector) {
      return SelectorFind.ancestor(finish, 'table').bind(function (table) {
        return SelectorFind.descendant(table, firstSelectedSelector).bind(function (start) {
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

    var shiftSelection = function (boxes, deltaRow, deltaColumn, firstSelectedSelector, lastSelectedSelector) {
      return getLast(boxes, lastSelectedSelector).bind(function (last) {
        return TablePositions.moveBy(last, deltaRow, deltaColumn).bind(function (finish) {
          return expandTo(finish, firstSelectedSelector);
        });
      });
    };

    return {
      identify: identify,
      retrieve: retrieve,
      shiftSelection: shiftSelection,
      getEdges: getEdges
    };
  }
);