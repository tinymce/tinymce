import { Arr, Optional } from '@ephox/katamari';
import { DomParent } from '@ephox/robin';
import { TablePositions } from '@ephox/snooker';
import { Compare, SelectorFilter, SelectorFind, Selectors, SugarElement } from '@ephox/sugar';

import { Identified, IdentifiedExt } from './Identified';

interface Edges {
  readonly first: SugarElement<HTMLTableCellElement>;
  readonly last: SugarElement<HTMLTableCellElement>;
  readonly table: SugarElement<HTMLTableElement>;
}

const lookupTable = (container: SugarElement<Node>) => {
  return SelectorFind.ancestor<HTMLTableElement>(container, 'table');
};

const identify = (start: SugarElement<HTMLTableCellElement>, finish: SugarElement<HTMLTableCellElement>, isRoot?: (element: SugarElement<Node>) => boolean): Optional<Identified> => {
  const getIsRoot = (rootTable: SugarElement<HTMLTableElement>) => {
    return (element: SugarElement<Node>) => {
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
    return lookupTable(start).bind((startTable) => {
      return lookupTable(finish).bind((finishTable) => {
        if (Compare.eq(startTable, finishTable)) { // Selecting from within the same table.
          return Optional.some({
            boxes: TablePositions.intercepts(startTable, start, finish),
            start,
            finish
          });
        } else if (Compare.contains(startTable, finishTable)) { // Selecting from the parent table to the nested table.
          const ancestorCells = SelectorFilter.ancestors<HTMLTableCellElement>(finish, 'td,th', getIsRoot(startTable));
          const finishCell = ancestorCells.length > 0 ? ancestorCells[ancestorCells.length - 1] : finish;
          return Optional.some({
            boxes: TablePositions.nestedIntercepts(startTable, start, startTable, finish, finishTable),
            start,
            finish: finishCell
          });
        } else if (Compare.contains(finishTable, startTable)) { // Selecting from the nested table to the parent table.
          const ancestorCells = SelectorFilter.ancestors<HTMLTableCellElement>(start, 'td,th', getIsRoot(finishTable));
          const startCell = ancestorCells.length > 0 ? ancestorCells[ancestorCells.length - 1] : start;
          return Optional.some({
            boxes: TablePositions.nestedIntercepts(finishTable, start, startTable, finish, finishTable),
            start,
            finish: startCell
          });
        } else { // Selecting from a nested table to a different nested table.
          return DomParent.ancestors(start, finish).shared.bind((lca) => {
            return SelectorFind.closest<HTMLTableElement>(lca, 'table', isRoot).bind((lcaTable) => {
              const finishAncestorCells = SelectorFilter.ancestors<HTMLTableCellElement>(finish, 'td,th', getIsRoot(lcaTable));
              const finishCell = finishAncestorCells.length > 0 ? finishAncestorCells[finishAncestorCells.length - 1] : finish;
              const startAncestorCells = SelectorFilter.ancestors<HTMLTableCellElement>(start, 'td,th', getIsRoot(lcaTable));
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

const retrieve = <T extends Element> (container: SugarElement<Node>, selector: string): Optional<SugarElement<T>[]> => {
  const sels = SelectorFilter.descendants<T>(container, selector);
  return sels.length > 0 ? Optional.some(sels) : Optional.none<SugarElement<T>[]>();
};

const getLast = (boxes: SugarElement<HTMLTableCellElement>[], lastSelectedSelector: string): Optional<SugarElement<HTMLTableCellElement>> => {
  return Arr.find(boxes, (box) => {
    return Selectors.is<HTMLTableCellElement>(box, lastSelectedSelector);
  });
};

const getEdges = (container: SugarElement<Node>, firstSelectedSelector: string, lastSelectedSelector: string): Optional<Edges> => {
  return SelectorFind.descendant<HTMLTableCellElement>(container, firstSelectedSelector).bind((first) => {
    return SelectorFind.descendant<HTMLTableCellElement>(container, lastSelectedSelector).bind((last) => {
      return DomParent.sharedOne(lookupTable, [ first, last ]).map((table) => {
        return {
          first,
          last,
          table
        };
      });
    });
  });
};

const expandTo = (finish: SugarElement<HTMLTableCellElement>, firstSelectedSelector: string): Optional<IdentifiedExt> => {
  return SelectorFind.ancestor<HTMLTableElement>(finish, 'table').bind((table) => {
    return SelectorFind.descendant<HTMLTableCellElement>(table, firstSelectedSelector).bind((start) => {
      return identify(start, finish).bind((identified) => {
        return identified.boxes.map<IdentifiedExt>((boxes) => {
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

const shiftSelection = (boxes: SugarElement<HTMLTableCellElement>[], deltaRow: number, deltaColumn: number,
                        firstSelectedSelector: string, lastSelectedSelector: string): Optional<IdentifiedExt> => {
  return getLast(boxes, lastSelectedSelector).bind((last) => {
    return TablePositions.moveBy(last, deltaRow, deltaColumn).bind((finish) => {
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
