import { Arr } from '@ephox/katamari';
import { Fun } from '@ephox/katamari';
import { Option } from '@ephox/katamari';
import { Struct } from '@ephox/katamari';
import { DomParent } from '@ephox/robin';
import { TablePositions } from '@ephox/snooker';
import { Compare } from '@ephox/sugar';
import { SelectorFilter } from '@ephox/sugar';
import { SelectorFind } from '@ephox/sugar';
import { Selectors } from '@ephox/sugar';

var lookupTable = function (container, isRoot) {
  return SelectorFind.ancestor(container, 'table');
};

var identified = Struct.immutableBag(['boxes', 'start', 'finish'], []);

var identify:any = function (start, finish, isRoot) {
  var getIsRoot = function (rootTable) {
    return function (element) {
      return isRoot(element) || Compare.eq(element, rootTable);
    };
  };

  // Optimisation: If the cells are equal, it's a single cell array
  if (Compare.eq(start, finish)) {
    return Option.some(identified({
      boxes: Option.some([ start ]),
      start: start,
      finish: finish
    }));
  } else {
    return lookupTable(start, isRoot).bind(function (startTable) {
      return lookupTable(finish, isRoot).bind(function (finishTable) {
        if (Compare.eq(startTable, finishTable)) { // Selecting from within the same table.
          return Option.some(identified({
            boxes: TablePositions.intercepts(startTable, start, finish),
            start: start,
            finish: finish
          }));
        } else if (Compare.contains(startTable, finishTable)) { // Selecting from the parent table to the nested table.
          var ancestorCells = SelectorFilter.ancestors(finish, 'td,th', getIsRoot(startTable));
          var finishCell = ancestorCells.length > 0 ? ancestorCells[ancestorCells.length - 1] : finish;
          return Option.some(identified({
            boxes: TablePositions.nestedIntercepts(startTable, start, startTable, finish, finishTable),
            start: start,
            finish: finishCell
          }));
        } else if (Compare.contains(finishTable, startTable)) { // Selecting from the nested table to the parent table.
          var ancestorCells = SelectorFilter.ancestors(start, 'td,th', getIsRoot(finishTable));
          var startCell = ancestorCells.length > 0 ? ancestorCells[ancestorCells.length - 1] : start;
          return Option.some(identified({
            boxes: TablePositions.nestedIntercepts(finishTable, start, startTable, finish, finishTable),
            start: start,
            finish: startCell
          }));
        } else { // Selecting from a nested table to a different nested table.
          return DomParent.ancestors(start, finish).shared().bind(function (lca) {
            return SelectorFind.closest(lca, 'table', isRoot).bind(function (lcaTable) {
              var finishAncestorCells = SelectorFilter.ancestors(finish, 'td,th', getIsRoot(lcaTable));
              var finishCell = finishAncestorCells.length > 0 ? finishAncestorCells[finishAncestorCells.length - 1] : finish;
              var startAncestorCells = SelectorFilter.ancestors(start, 'td,th', getIsRoot(lcaTable));
              var startCell = startAncestorCells.length > 0 ? startAncestorCells[startAncestorCells.length - 1] : start;
              return Option.some(identified({
                boxes: TablePositions.nestedIntercepts(lcaTable, start, startTable, finish, finishTable),
                start: startCell,
                finish: finishCell
              }));
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
  return Arr.find(boxes, function (box) {
    return Selectors.is(box, lastSelectedSelector);
  });
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
      return identify(start, finish).bind(function (identified) {
        return identified.boxes().map(function (boxes) {
          return {
            boxes: Fun.constant(boxes),
            start: Fun.constant(identified.start()),
            finish: Fun.constant(identified.finish())
          }
        });
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

export default <any> {
  identify: identify,
  retrieve: retrieve,
  shiftSelection: shiftSelection,
  getEdges: getEdges
};