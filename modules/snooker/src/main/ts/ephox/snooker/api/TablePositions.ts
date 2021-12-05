import { Optional } from '@ephox/katamari';
import { Compare, SugarElement } from '@ephox/sugar';

import * as CellFinder from '../selection/CellFinder';
import * as CellGroup from '../selection/CellGroup';
import { Bounds } from './Structs';
import * as TableLookup from './TableLookup';
import { Warehouse } from './Warehouse';

const moveBy = (cell: SugarElement<HTMLTableCellElement>, deltaRow: number, deltaColumn: number): Optional<SugarElement<HTMLTableCellElement>> => {
  return TableLookup.table(cell).bind((table) => {
    const warehouse = getWarehouse(table);
    return CellFinder.moveBy(warehouse, cell, deltaRow, deltaColumn);
  });
};

const intercepts = (
  table: SugarElement<HTMLTableElement>,
  first: SugarElement<HTMLTableCellElement>,
  last: SugarElement<HTMLTableCellElement>
): Optional<SugarElement<HTMLTableCellElement>[]> => {
  const warehouse = getWarehouse(table);
  return CellFinder.intercepts(warehouse, first, last);
};

const nestedIntercepts = (
  table: SugarElement<HTMLTableElement>,
  first: SugarElement<HTMLTableCellElement>,
  firstTable: SugarElement<HTMLTableElement>,
  last: SugarElement<HTMLTableCellElement>,
  lastTable: SugarElement<HTMLTableElement>
): Optional<SugarElement<HTMLTableCellElement>[]> => {
  const warehouse = getWarehouse(table);
  const optStartCell = Compare.eq(table, firstTable) ? Optional.some(first) : CellFinder.parentCell(warehouse, first);
  const optLastCell = Compare.eq(table, lastTable) ? Optional.some(last) : CellFinder.parentCell(warehouse, last);
  return optStartCell.bind(
    (startCell) => optLastCell.bind(
      (lastCell) => CellFinder.intercepts(warehouse, startCell, lastCell)
    )
  );
};

const getBox = (table: SugarElement<HTMLTableElement>, first: SugarElement<HTMLTableCellElement>, last: SugarElement<HTMLTableCellElement>): Optional<Bounds> => {
  const warehouse = getWarehouse(table);
  return CellGroup.getBox(warehouse, first, last);
};

// Private method ... keep warehouse in snooker, please.
const getWarehouse = Warehouse.fromTable;

export {
  moveBy,
  intercepts,
  nestedIntercepts,
  getBox
};
