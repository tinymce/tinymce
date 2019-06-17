import { Option } from '@ephox/katamari';
import { Compare, Element } from '@ephox/sugar';
import DetailsList from '../model/DetailsList';
import { Warehouse } from '../model/Warehouse';
import CellFinder from '../selection/CellFinder';
import CellGroup from '../selection/CellGroup';
import TableLookup from './TableLookup';

const moveBy = function (cell: Element, deltaRow: number, deltaColumn: number) {
  return TableLookup.table(cell).bind(function (table) {
    const warehouse = getWarehouse(table);
    return CellFinder.moveBy(warehouse, cell, deltaRow, deltaColumn);
  });
};

const intercepts = function (table: Element, first: Element, last: Element) {
  const warehouse = getWarehouse(table);
  return CellFinder.intercepts(warehouse, first, last);
};

const nestedIntercepts = function (table: Element, first: Element, firstTable: Element, last: Element, lastTable: Element) {
  const warehouse = getWarehouse(table);
  const optStartCell = Compare.eq(table, firstTable) ? Option.some(first) : CellFinder.parentCell(warehouse, first);
  const optLastCell = Compare.eq(table, lastTable) ? Option.some(last) : CellFinder.parentCell(warehouse, last);
  return optStartCell.bind(
    (startCell) => optLastCell.bind(
      (lastCell) => CellFinder.intercepts(warehouse, startCell, lastCell)
    )
  );
};

const getBox = function (table: Element, first: Element, last: Element) {
  const warehouse = getWarehouse(table);
  return CellGroup.getBox(warehouse, first, last);
};

// Private method ... keep warehouse in snooker, please.
const getWarehouse = function (table: Element) {
  const list = DetailsList.fromTable(table);
  return Warehouse.generate(list);
};

export default {
  moveBy,
  intercepts,
  nestedIntercepts,
  getBox
};