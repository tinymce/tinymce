import { Element } from '@ephox/sugar';
import { Warehouse } from '../model/Warehouse';

const getGridSize = function (table: Element) {
  const warehouse = Warehouse.fromTable(table);
  return warehouse.grid;
};

export {
  getGridSize
};
