import DetailsList from '../model/DetailsList';
import Warehouse from '../model/Warehouse';

const getGridSize = function (table) {
  const input = DetailsList.fromTable(table);
  const warehouse = Warehouse.generate(input);
  return warehouse.grid();
};

export default {
  getGridSize
};