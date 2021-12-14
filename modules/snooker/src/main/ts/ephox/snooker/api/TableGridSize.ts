import { SugarElement } from '@ephox/sugar';

import { Grid } from './Structs';
import { Warehouse } from './Warehouse';

const getGridSize = (table: SugarElement<HTMLTableElement>): Grid => {
  const warehouse = Warehouse.fromTable(table);
  return warehouse.grid;
};

export {
  getGridSize
};
