define(
  'ephox.snooker.api.TableGridSize',

  [
    'ephox.snooker.model.DetailsList',
    'ephox.snooker.model.Warehouse'
  ],

  function (DetailsList, Warehouse) {
    var getGridSize = function (table) {
      var input = DetailsList.fromTable(table);
      var warehouse = Warehouse.generate(input);
      return warehouse.grid();
    };

    return {
      getGridSize: getGridSize
    };
  }
);