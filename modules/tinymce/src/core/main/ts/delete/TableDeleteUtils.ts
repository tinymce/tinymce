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

const getTable = (node: Node, isRoot: IsRootFn) => TableCellSelection.getClosestTable(SugarElement.fromDom(node), isRoot);

const selectionInTableWithNestedTable = (details: TableSelectionDetails, rng: Range, isRoot: IsRootFn): TableSelectionDetails => {
  const commonAncestorContainerTable = getTable(rng.commonAncestorContainer, isRoot);

  const areTheSameTableAtTheStart = areSameTable(details.startTable, details.endTable);
  const isStartTableSameAsCommonAncestorTable = areSameTable(details.startTable, commonAncestorContainerTable) && !areTheSameTableAtTheStart;
  const isEndTableSameAsCommonAncestorTable = areSameTable(details.endTable, commonAncestorContainerTable) && !areTheSameTableAtTheStart;

  if (!isStartTableSameAsCommonAncestorTable && !isEndTableSameAsCommonAncestorTable) {
    return details;
  }

  const startTable = details.startTable.filter(Fun.constant(!isStartTableSameAsCommonAncestorTable));
  const endTable = details.endTable.filter(Fun.constant(!isEndTableSameAsCommonAncestorTable));
  const isSameTable = false;
  const isMultiTable = false;

  return {
    ...details,
    startTable,
    endTable,
    isSameTable,
    isMultiTable
  };
};

const adjustQuirksInDetails = (details: TableSelectionDetails, rng: Range, isRoot: IsRootFn): TableSelectionDetails => {
  return selectionInTableWithNestedTable(details, rng, isRoot);
};

const getTableDetailsFromRange = (rng: Range, isRoot: IsRootFn): TableSelectionDetails => {
  const getTable = (node: Node) => TableCellSelection.getClosestTable(SugarElement.fromDom(node), isRoot);
  const startTable = getTable(rng.startContainer);
  const endTable = getTable(rng.endContainer);
  const isStartInTable = startTable.isSome();
  const isEndInTable = endTable.isSome();
  // Partial selection - selection is not within the same table
  const isSameTable = Optionals.lift2(startTable, endTable, Compare.eq).getOr(false);
  const isMultiTable = !isSameTable && isStartInTable && isEndInTable;

  return adjustQuirksInDetails({
    startTable,
    endTable,
    isStartInTable,
    isEndInTable,
    isSameTable,
    isMultiTable
  }, rng, isRoot);
};

export {
  getTableDetailsFromRange,
  isRootFromElement,
  getTableCells
};
