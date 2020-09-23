import { Optional } from '@ephox/katamari';
import { Compare, SugarElement } from '@ephox/sugar';
import * as CellFinder from '../selection/CellFinder';
import * as CellGroup from '../selection/CellGroup';
import * as TableLookup from './TableLookup';
import { Warehouse } from './Warehouse';

const moveBy = function (cell: SugarElement, deltaRow: number, deltaColumn: number) {
  return TableLookup.table(cell).bind(function (table) {
    const warehouse = getWarehouse(table);
    return CellFinder.moveBy(warehouse, cell, deltaRow, deltaColumn);
  });
};

const intercepts = function (table: SugarElement, first: SugarElement, last: SugarElement) {
  const warehouse = getWarehouse(table);
  return CellFinder.intercepts(warehouse, first, last);
};

const nestedIntercepts = function (table: SugarElement, first: SugarElement, firstTable: SugarElement, last: SugarElement, lastTable: SugarElement) {
  const warehouse = getWarehouse(table);
  const optStartCell = Compare.eq(table, firstTable) ? Optional.some(first) : CellFinder.parentCell(warehouse, first);
  const optLastCell = Compare.eq(table, lastTable) ? Optional.some(last) : CellFinder.parentCell(warehouse, last);
  return optStartCell.bind(
    (startCell) => optLastCell.bind(
      (lastCell) => CellFinder.intercepts(warehouse, startCell, lastCell)
    )
  );
};

const getBox = function (table: SugarElement, first: SugarElement, last: SugarElement) {
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
