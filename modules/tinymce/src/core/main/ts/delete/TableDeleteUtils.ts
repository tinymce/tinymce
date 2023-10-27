import { Optional, Optionals } from '@ephox/katamari';
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

const getTable = (node: Node, isRoot: IsRootFn) => TableCellSelection.getClosestTable(SugarElement.fromDom(node), isRoot);

const selectionInTableWithNestedTable = (details: TableSelectionDetails, rng: Range, isRoot: IsRootFn): TableSelectionDetails => {
  return Optionals.lift3(details.startTable, details.endTable, getTable(rng.commonAncestorContainer, isRoot), (startTable, endTable, ancestorTable) => {
    const areTheSameTableAtTheStart = Compare.eq(startTable, endTable);
    const isStartTableSameAsCommonAncestorTable = Compare.eq(startTable, ancestorTable) && !areTheSameTableAtTheStart;
    const isEndTableSameAsCommonAncestorTable = Compare.eq(endTable, ancestorTable) && !areTheSameTableAtTheStart;

    return !isStartTableSameAsCommonAncestorTable && !isEndTableSameAsCommonAncestorTable ? details : {
      ...details,
      startTable: !isStartTableSameAsCommonAncestorTable ? details.startTable : Optional.none(),
      endTable: !isEndTableSameAsCommonAncestorTable ? details.endTable : Optional.none(),
      isSameTable: false,
      isMultiTable: false
    };
  }).getOr(details);
};

const adjustQuirksInDetails = (details: TableSelectionDetails, rng: Range, isRoot: IsRootFn): TableSelectionDetails => {
  return selectionInTableWithNestedTable(details, rng, isRoot);
};

const getTableDetailsFromRange = (rng: Range, isRoot: IsRootFn): TableSelectionDetails => {
  const startTable = getTable(rng.startContainer, isRoot);
  const endTable = getTable(rng.endContainer, isRoot);
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
