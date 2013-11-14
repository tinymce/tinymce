define(
  'ephox.snooker.tbio.resize.width.ColumnDragging',

  [
    'ephox.compass.Arr',
    'ephox.snooker.activate.Water',
    'ephox.snooker.adjust.Dimensions',
    'ephox.snooker.tbio.query.Groupings'
  ],

  function (Arr, Water, Dimensions, Groupings) {
    return function () {
      var refresh = function () {
        resize(0, 0);
      };

      var resize = function (col, delta) {
        var column = col !== undefined ? parseInt(col, 10) : 0;
        var step = delta !== undefined ? parseInt(delta, 10) : 0;
        var topRow = Groupings.row(table, 0);

        var widths = Arr.map(topRow, Dimensions.getWidth);
        var adjustments = Water.water(widths, column, step, 10);
        // console.log('adjustments: ', water);
        Arr.map(topRow, function (cell, i) {
          Dimensions.addWidth(cell, adjustments[i]);
        });

        var total = Arr.foldr(water, function (b, a) { return b + a; }, 0);
        Dimensions.addWidth(table, total);
      };



      mutation.events.drag.bind(function (event) {
        var cells = SelectorFind.ancestor(event.target(), 'tr').map(Traverse.children).getOr([]);
        var real = Arr.filter(cells, function (c) {
          return !Class.has(c, 'mogel');
        });

        var column = Attr.get(event.target(), 'data-column-id');
        resize(column, event.xDelta());
        // Dimensions.adjust(event.target(), event.xDelta(), 0);
      });

    };

  }
);
