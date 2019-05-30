import TableLookup from './TableLookup';
import DetailsList from '../model/DetailsList';
import Warehouse from '../model/Warehouse';
import CellFinder from '../selection/CellFinder';
import CellGroup from '../selection/CellGroup';
import { Compare } from '@ephox/sugar';

const moveBy = function (cell, deltaRow, deltaColumn) {
  return TableLookup.table(cell).bind(function (table) {
    const warehouse = getWarehouse(table);
    return CellFinder.moveBy(warehouse, cell, deltaRow, deltaColumn);
  });
};

const intercepts = function (table, first, last) {
  const warehouse = getWarehouse(table);
  return CellFinder.intercepts(warehouse, first, last);
};

const nestedIntercepts = function (table, first, firstTable, last, lastTable) {
  const warehouse = getWarehouse(table);
  const startCell = Compare.eq(table, firstTable) ? first : CellFinder.parentCell(warehouse, first);
  const lastCell = Compare.eq(table, lastTable) ? last : CellFinder.parentCell(warehouse, last);
  return CellFinder.intercepts(warehouse, startCell, lastCell);
};

const getBox = function (table, first, last) {
  const warehouse = getWarehouse(table);
  return CellGroup.getBox(warehouse, first, last);
};

// Private method ... keep warehouse in snooker, please.
const getWarehouse = function (table) {
  const list = DetailsList.fromTable(table);
  return Warehouse.generate(list);
};

export default {
  moveBy,
  intercepts,
  nestedIntercepts,
  getBox
};