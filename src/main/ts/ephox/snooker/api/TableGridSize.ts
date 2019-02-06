import DetailsList from '../model/DetailsList';
import Warehouse from '../model/Warehouse';

var getGridSize = function (table) {
  var input = DetailsList.fromTable(table);
  var warehouse = Warehouse.generate(input);
  return warehouse.grid();
};

export default {
  getGridSize: getGridSize
};