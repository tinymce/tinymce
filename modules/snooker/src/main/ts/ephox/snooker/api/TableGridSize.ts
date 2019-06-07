import DetailsList from '../model/DetailsList';
import { Warehouse } from '../model/Warehouse';
import { Element } from '@ephox/sugar';

const getGridSize = function (table: Element) {
  const input = DetailsList.fromTable(table);
  const warehouse = Warehouse.generate(input);
  return warehouse.grid();
};

export default {
  getGridSize
};