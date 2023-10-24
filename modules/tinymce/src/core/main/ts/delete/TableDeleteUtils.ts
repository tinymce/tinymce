import { Fun, Optional, Optionals } from '@ephox/katamari';
import { Compare, SelectorFilter, SugarElement } from '@ephox/sugar';

import * as TableCellSelection from '../selection/TableCellSelection';

export type IsRootFn = (e: SugarElement<Node>) => boolean;

export interface TableSelectionDetails {
  readonly startTable: Optional<SugarElement<HTMLTableElement>>;
  readonly endTable: Optional<SugarElement<HTMLTableElement>>;
  readonly isStartInTable: boolean;
  readonly isEndInTable: boolean;
  readonly isSameTable: boolean;
  readonly isMultiTable: boolean;
}

const isRootFromElement = (root: SugarElement<Node>): IsRootFn =>
  (cur: SugarElement<Node>): boolean => Compare.eq(root, cur);

const getTableCells = (table: SugarElement<HTMLTableElement>): SugarElement<HTMLTableCellElement>[] =>
  SelectorFilter.descendants<HTMLTableCellElement>(table, 'td,th');

const areSameTable = (table1: Optional<SugarElement<HTMLTableElement>>, table2: Optional<SugarElement<HTMLTableElement>>): boolean =>
  Optionals.lift2(table1, table2, Compare.eq).getOr(false);

const getTableDetailsFromRange = (rng: Range, isRoot: IsRootFn): TableSelectionDetails => {
  const getTable = (node: Node) => TableCellSelection.getClosestTable(SugarElement.fromDom(node), isRoot);
  const commonAncestorContainerTable = getTable(rng.commonAncestorContainer);
  let startTable = getTable(rng.startContainer);
  let endTable = getTable(rng.endContainer);

  const isSameTableAtTheStart = areSameTable(startTable, endTable);

  const isStartTableSameAsCommonAncestorTable = areSameTable(startTable, commonAncestorContainerTable) && !isSameTableAtTheStart;
  startTable = startTable.filter(Fun.constant(!isStartTableSameAsCommonAncestorTable));

  const isEndTableSameAsCommonAncestorTable = areSameTable(endTable, commonAncestorContainerTable) && !isSameTableAtTheStart;
  endTable = endTable.filter(Fun.constant(!isEndTableSameAsCommonAncestorTable));

  const isStartInTable = startTable.isSome();
  const isEndInTable = endTable.isSome();
  const noTableSameAsCommonAncestorTable = !isStartTableSameAsCommonAncestorTable && !isEndTableSameAsCommonAncestorTable;

  const isSameTable = areSameTable(startTable, endTable) && noTableSameAsCommonAncestorTable;
  const isMultiTable = !isSameTable && isStartInTable && isEndInTable && noTableSameAsCommonAncestorTable;

  return {
    startTable,
    endTable,
    isStartInTable,
    isEndInTable,
    isSameTable,
    isMultiTable
  };
};

export {
  getTableDetailsFromRange,
  isRootFromElement,
  getTableCells
};
