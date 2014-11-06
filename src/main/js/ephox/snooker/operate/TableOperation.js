define(
  'ephox.snooker.operate.TableOperation',

  [
    'ephox.snooker.lookup.TagLookup',
    'ephox.snooker.model.DetailsList',
    'ephox.snooker.model.Warehouse',
    'ephox.snooker.operate.Redraw',
    'ephox.snooker.resize.Bars'
  ],

  function (TagLookup, DetailsList, Warehouse, Redraw, Bars) {
    var run = function (container, table, cell, operation, adjustment, direction) {
      TagLookup.detect(cell).each(function (dompos) {
        var list = DetailsList.fromTable(table);

        var warehouse = Warehouse.generate(list);
        var post = operation(warehouse, dompos);

        Redraw.render(table, post);
        adjustment(post);
        Bars.refresh(container, table, direction);
      });
    };

    return {
      run: run
    };

  }
);
