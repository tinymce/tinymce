define(
  'ephox.snooker.model.Warefun',

  [
    'ephox.peanut.Fun',
    'ephox.snooker.model.Warehouse'
  ],

  function (Fun, Warehouse) {
    // This needs to a return a list of:
    //
    //   element: TR DOM elements,
    //   cells: List of
    //     colspan: Int,
    //     rowspan: Int,
    //     element: TD/TH DOM element
    var render = function (warehouse) {
      // warehouse.all() should not be used, and will probably be removed if we can.
      //Warehouse.getAt(warehouse, row, column)
      //warehouse.grid()


      var rows = [];

      for (var r = 0; r < warehouse.grid().rows(); r++) {
        var builder = {};
        builder.element = Fun.constant('row');
        builder.cells = Fun.constant([]);
        for (var c = 0; c < warehouse.grid().columns(); c++) {
          Warehouse.getAt(warehouse, r, c).fold(function () {
            // not there.
          }, function (detail) {
            var cell = {};
            cell.element = detail.element;
            cell.colspan = detail.colspan;
            cell.rowspan = detail.rowspan;
            builder.cells().push(cell);
          });
        }
        rows.push(builder);
      }




      return rows;
    };

    return {
      render: render
    };
  }
);