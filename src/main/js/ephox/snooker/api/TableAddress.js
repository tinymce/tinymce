define(
  'ephox.snooker.api.TableAddress',

  [
    'ephox.compass.Obj',
    'ephox.snooker.api.TableLookup',
    'ephox.snooker.model.Warehouse',
    'ephox.sugar.api.Compare'
  ],

  function (Obj, TableLookup, Warehouse, Compare) {
    var element = function (table, element) {
      var wh = Warehouse.fromTable(table);
      return TableLookup.cell(element).map(function (startCell) {
        return Obj.find(wh.access(), function (cell, i, obj) {
          return Compare.eq(startCell, cell.element());
        });
      });
    };

    return {
      element: element
    };
  }
);