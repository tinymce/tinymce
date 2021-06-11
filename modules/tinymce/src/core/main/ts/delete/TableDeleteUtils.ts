/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Optional, Optionals } from '@ephox/katamari';
import { Compare, SelectorFilter, SugarElement } from '@ephox/sugar';
import * as TableCellSelection from '../selection/TableCellSelection';

export type IsRootFn = (e: SugarElement<any>) => boolean;

export interface TableSelectionDetails {
  readonly startTable: Optional<SugarElement<HTMLTableElement>>;
  readonly endTable: Optional<SugarElement<HTMLTableElement>>;
  readonly startInTable: boolean;
  readonly endInTable: boolean;
  readonly partialSelection: boolean;
  readonly multiTableSelection: boolean;
}

const isRootFromElement = (root: SugarElement<any>): IsRootFn =>
  (cur: SugarElement<any>): boolean => Compare.eq(root, cur);

const getTableCells = (table: SugarElement<HTMLTableElement>) =>
  SelectorFilter.descendants<HTMLTableCellElement>(table, 'td,th');

// const getTableDetailsFromRange = (rng: Range, isRoot: IsRootFn): TableSelectionDetails => {
const getTableDetailsFromRange = (rng: Range, root: SugarElement): TableSelectionDetails => {
  const isRoot = isRootFromElement(root);
  const getTable = (elm: SugarElement<Node>) => TableCellSelection.getClosestTable(elm, isRoot);
  const startTable = getTable(SugarElement.fromDom(rng.startContainer));
  const endTable = getTable(SugarElement.fromDom(rng.endContainer));
  const startInTable = startTable.isSome();
  const endInTable = endTable.isSome();
  // Partial selection - selection is not within the same table
  const partialSelection = Optionals.lift2(startTable, endTable, (startTable, endTable) => !Compare.eq(startTable, endTable)).getOr(true);
  const multiTableSelection = partialSelection && startInTable && endInTable;

  return {
    startTable,
    endTable,
    startInTable,
    endInTable,
    partialSelection,
    multiTableSelection
  };
};

export {
  getTableDetailsFromRange,
  isRootFromElement,
  getTableCells
};
