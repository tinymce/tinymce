import { Arr, Optional } from '@ephox/katamari';
import { DomParent } from '@ephox/robin';
import { TablePositions } from '@ephox/snooker';
import { Compare, SelectorFilter, SelectorFind, Selectors, SugarElement } from '@ephox/sugar';
import { Identified, IdentifiedExt } from './Identified';

interface Edges {
  readonly first: SugarElement;
  readonly last: SugarElement;
  readonly table: SugarElement<HTMLTableElement>;
}

const lookupTable = function (container: SugarElement) {
  return SelectorFind.ancestor(container, 'table');
};

const identify = function (start: SugarElement, finish: SugarElement, isRoot?: (element: SugarElement) => boolean): Optional<Identified> {
  const getIsRoot = function (rootTable: SugarElement) {
    return function (element: SugarElement) {
      return (isRoot !== undefined && isRoot(element)) || Compare.eq(element, rootTable);
    };
  };

  // Optimisation: If the cells are equal, it's a single cell array
  if (Compare.eq(start, finish)) {
    return Optional.some({
      boxes: Optional.some([ start ]),
      start,
      finish
    });
  } else {
    return lookupTable(start).bind(function (startTable) {
      return lookupTable(finish).bind(function (finishTable) {
        if (Compare.eq(startTable, finishTable)) { // Selecting from within the same table.
          return Optional.some({
            boxes: TablePositions.intercepts(startTable, start, finish),
            start,
            finish
          });
        } else if (Compare.contains(startTable, finishTable)) { // Selecting from the parent table to the nested table.
          const ancestorCells = SelectorFilter.ancestors(finish, 'td,th', getIsRoot(startTable));
          const finishCell = ancestorCells.length > 0 ? ancestorCells[ancestorCells.length - 1] : finish;
          return Optional.some({
            boxes: TablePositions.nestedIntercepts(startTable, start, startTable, finish, finishTable),
            start,
            finish: finishCell
          });
        } else if (Compare.contains(finishTable, startTable)) { // Selecting from the nested table to the parent table.
          const ancestorCells = SelectorFilter.ancestors(start, 'td,th', getIsRoot(finishTable));
          const startCell = ancestorCells.length > 0 ? ancestorCells[ancestorCells.length - 1] : start;
          return Optional.some({
            boxes: TablePositions.nestedIntercepts(finishTable, start, startTable, finish, finishTable),
            start,
            finish: startCell
          });
        } else { // Selecting from a nested table to a different nested table.
          return DomParent.ancestors(start, finish).shared.bind(function (lca) {
            return SelectorFind.closest(lca, 'table', isRoot).bind(function (lcaTable) {
              const finishAncestorCells = SelectorFilter.ancestors(finish, 'td,th', getIsRoot(lcaTable));
              const finishCell = finishAncestorCells.length > 0 ? finishAncestorCells[finishAncestorCells.length - 1] : finish;
              const startAncestorCells = SelectorFilter.ancestors(start, 'td,th', getIsRoot(lcaTable));
              const startCell = startAncestorCells.length > 0 ? startAncestorCells[startAncestorCells.length - 1] : start;
              return Optional.some({
                boxes: TablePositions.nestedIntercepts(lcaTable, start, startTable, finish, finishTable),
                start: startCell,
                finish: finishCell
              });
            });
          });
        }
      });
    });
  }
};

const retrieve = function <T extends Element> (container: SugarElement<Node>, selector: string): Optional<SugarElement<T>[]> {
  const sels = SelectorFilter.descendants<T>(container, selector);
  return sels.length > 0 ? Optional.some(sels) : Optional.none<SugarElement<T>[]>();
};

const getLast = function (boxes: SugarElement[], lastSelectedSelector: string) {
  return Arr.find(boxes, function (box) {
    return Selectors.is(box, lastSelectedSelector);
  });
};

const getEdges = function (container: SugarElement, firstSelectedSelector: string, lastSelectedSelector: string): Optional<Edges> {
  return SelectorFind.descendant(container, firstSelectedSelector).bind(function (first) {
    return SelectorFind.descendant(container, lastSelectedSelector).bind(function (last) {
      return DomParent.sharedOne(lookupTable, [ first, last ]).map(function (table) {
        return {
          first,
          last,
          table
        };
      });
    });
  });
};

const expandTo = function (finish: SugarElement, firstSelectedSelector: string): Optional<IdentifiedExt> {
  return SelectorFind.ancestor(finish, 'table').bind(function (table) {
    return SelectorFind.descendant(table, firstSelectedSelector).bind(function (start) {
      return identify(start, finish).bind(function (identified) {
        return identified.boxes.map<IdentifiedExt>(function (boxes) {
          return {
            boxes,
            start: identified.start,
            finish: identified.finish
          };
        });
      });
    });
  });
};

const shiftSelection = function (boxes: SugarElement[], deltaRow: number, deltaColumn: number, firstSelectedSelector: string, lastSelectedSelector: string) {
  return getLast(boxes, lastSelectedSelector).bind(function (last) {
    return TablePositions.moveBy(last, deltaRow, deltaColumn).bind(function (finish) {
      return expandTo(finish, firstSelectedSelector);
    });
  });
};

export {
  identify,
  retrieve,
  shiftSelection,
  getEdges
};
