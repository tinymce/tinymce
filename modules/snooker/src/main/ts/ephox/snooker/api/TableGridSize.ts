import { SugarElement } from '@ephox/sugar';
import { Warehouse } from './Warehouse';

const getGridSize = function (table: SugarElement) {
  const warehouse = Warehouse.fromTable(table);
  return warehouse.grid;
};

export {
  getGridSize
};
