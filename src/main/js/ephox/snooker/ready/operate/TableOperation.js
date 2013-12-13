define(
  'ephox.snooker.ready.operate.TableOperation',

  [
    'ephox.snooker.ready.lookup.TagLookup',
    'ephox.snooker.ready.model.DetailsList',
    'ephox.snooker.ready.model.Warehouse',
    'ephox.snooker.ready.operate.Redraw',
    'ephox.snooker.ready.resize.Adjustments',
    'ephox.snooker.ready.resize.Bars'
  ],

  function (TagLookup, DetailsList, Warehouse, Redraw, Adjustments, Bars) {
    var run = function (container, table, cell, operation) {
      TagLookup.detect(cell).each(function (gridpos) {
        var list = DetailsList.fromTable(table);

        var warehouse = Warehouse.generate(list);
        console.log('post: ', warehouse.grid().rows(), warehouse.grid().columns());
        var post = operation(warehouse, gridpos);

        Redraw.render(table, post);
        Adjustments.adjustTo(post);
        Bars.refresh(container, table);
      });
    };

    return {
      run: run
    };

  }
);
