import { Arr, Fun, Option } from '@ephox/katamari';
import { DomParent } from '@ephox/robin';
import { TablePositions } from '@ephox/snooker';
import { Compare, SelectorFilter, SelectorFind, Selectors, Element } from '@ephox/sugar';
import { Identified, IdentifiedExt } from './Identified';
import { Node as DomNode, Element as DomElement } from '@ephox/dom-globals';

const lookupTable = function (container: Element) {
  return SelectorFind.ancestor(container, 'table');
};

const identify = function (start: Element, finish: Element, isRoot?: (element: Element) => boolean): Option<Identified> {
  const getIsRoot = function (rootTable: Element) {
    return function (element: Element) {
      return (isRoot !== undefined && isRoot(element)) || Compare.eq(element, rootTable);
    };
  };

  // Optimisation: If the cells are equal, it's a single cell array
  if (Compare.eq(start, finish)) {
    return Option.some(Identified.create({
      boxes: Option.some([start]),
      start,
      finish
    }));
  } else {
    return lookupTable(start).bind(function (startTable) {
      return lookupTable(finish).bind(function (finishTable) {
        if (Compare.eq(startTable, finishTable)) { // Selecting from within the same table.
          return Option.some(Identified.create({
            boxes: TablePositions.intercepts(startTable, start, finish),
            start,
            finish
          }));
        } else if (Compare.contains(startTable, finishTable)) { // Selecting from the parent table to the nested table.
          const ancestorCells = SelectorFilter.ancestors(finish, 'td,th', getIsRoot(startTable));
          const finishCell = ancestorCells.length > 0 ? ancestorCells[ancestorCells.length - 1] : finish;
          return Option.some(Identified.create({
            boxes: TablePositions.nestedIntercepts(startTable, start, startTable, finish, finishTable),
            start,
            finish: finishCell
          }));
        } else if (Compare.contains(finishTable, startTable)) { // Selecting from the nested table to the parent table.
          const ancestorCells = SelectorFilter.ancestors(start, 'td,th', getIsRoot(finishTable));
          const startCell = ancestorCells.length > 0 ? ancestorCells[ancestorCells.length - 1] : start;
          return Option.some(Identified.create({
            boxes: TablePositions.nestedIntercepts(finishTable, start, startTable, finish, finishTable),
            start,
            finish: startCell
          }));
        } else { // Selecting from a nested table to a different nested table.
          return DomParent.ancestors(start, finish).shared().bind(function (lca) {
            return SelectorFind.closest(lca, 'table', isRoot).bind(function (lcaTable) {
              const finishAncestorCells = SelectorFilter.ancestors(finish, 'td,th', getIsRoot(lcaTable));
              const finishCell = finishAncestorCells.length > 0 ? finishAncestorCells[finishAncestorCells.length - 1] : finish;
              const startAncestorCells = SelectorFilter.ancestors(start, 'td,th', getIsRoot(lcaTable));
              const startCell = startAncestorCells.length > 0 ? startAncestorCells[startAncestorCells.length - 1] : start;
              return Option.some(Identified.create({
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

const retrieve = function (container: Element<DomNode>, selector: string) {
  const sels = SelectorFilter.descendants(container, selector);
  return sels.length > 0 ? Option.some(sels) : Option.none<Element<DomElement>[]>();
};

const getLast = function (boxes: Element[], lastSelectedSelector: string) {
  return Arr.find(boxes, function (box) {
    return Selectors.is(box, lastSelectedSelector);
  });
};

const getEdges = function (container: Element, firstSelectedSelector: string, lastSelectedSelector: string) {
  return SelectorFind.descendant(container, firstSelectedSelector).bind(function (first) {
    return SelectorFind.descendant(container, lastSelectedSelector).bind(function (last) {
      return DomParent.sharedOne(lookupTable, [first, last]).map(function (tbl) {
        return {
          first: Fun.constant(first),
          last: Fun.constant(last),
          table: Fun.constant(tbl)
        };
      });
    });
  });
};

const expandTo = function (finish: Element, firstSelectedSelector: string) {
  return SelectorFind.ancestor(finish, 'table').bind(function (table) {
    return SelectorFind.descendant(table, firstSelectedSelector).bind(function (start) {
      return identify(start, finish).bind(function (identified) {
        return identified.boxes().map<IdentifiedExt>(function (boxes) {
          return {
            boxes: Fun.constant(boxes),
            start: Fun.constant(identified.start()),
            finish: Fun.constant(identified.finish())
          };
        });
      });
    });
  });
};

const shiftSelection = function (boxes: Element[], deltaRow: number, deltaColumn: number, firstSelectedSelector: string, lastSelectedSelector: string) {
  return getLast(boxes, lastSelectedSelector).bind(function (last) {
    return TablePositions.moveBy(last, deltaRow, deltaColumn).bind(function (finish) {
      return expandTo(finish, firstSelectedSelector);
    });
  });
};

export default {
  identify,
  retrieve,
  shiftSelection,
  getEdges
};