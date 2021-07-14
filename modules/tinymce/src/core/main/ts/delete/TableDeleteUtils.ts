/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

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

const getTableDetailsFromRange = (rng: Range, isRoot: IsRootFn): TableSelectionDetails => {
  const getTable = (node: Node) => TableCellSelection.getClosestTable(SugarElement.fromDom(node), isRoot);
  const startTable = getTable(rng.startContainer);
  const endTable = getTable(rng.endContainer);
  const isStartInTable = startTable.isSome();
  const isEndInTable = endTable.isSome();
  // Partial selection - selection is not within the same table
  const isSameTable = Optionals.lift2(startTable, endTable, Compare.eq).getOr(false);
  const isMultiTable = !isSameTable && isStartInTable && isEndInTable;

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
