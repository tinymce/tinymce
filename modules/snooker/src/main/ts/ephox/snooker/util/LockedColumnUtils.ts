import { Arr, Fun, Obj, Optional } from '@ephox/katamari';
import { Attribute, SugarElement } from '@ephox/sugar';
import * as Structs from '../api/Structs';
import * as GridRow from '../model/GridRow';

export const LOCKED_COL_ATTR = 'data-snooker-locked-cols';

const getLockedColumnsFromTable = (table: SugarElement<HTMLTableElement>): Optional<Record<number, true>> =>
  Attribute.getOpt(table, LOCKED_COL_ATTR)
    .bind((lockedColStr) => Optional.from(lockedColStr.match(/\d+/g)))
    .map((lockedColArr) => Arr.map(lockedColArr, (lockedCol) => parseInt(lockedCol, 10)))
    .map((lockedCols) => Arr.mapToObject(lockedCols, Fun.always));

// Need to check all of the cells to determine which columns are locked - reasoning is because rowspan and colspan cells where the same cell is used by multiple columns
const getLockedColumnsFromGrid = (grid: Structs.RowCells[]): number[] => {
  const locked = Arr.foldl(GridRow.extractGridDetails(grid).rows, (acc, row) => {
    Arr.each(row.cells, (cell, idx) => {
      if (cell.isLocked) {
        acc[idx] = true;
      }
    });
    return acc;
  }, {} as Record<number, boolean>);

  return Obj.mapToArray(locked, (_val, key) => parseInt(key, 10));
};

export {
  getLockedColumnsFromTable,
  getLockedColumnsFromGrid
};
