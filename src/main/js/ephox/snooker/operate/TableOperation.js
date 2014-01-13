define(
  'ephox.snooker.operate.TableOperation',

  [
    'ephox.snooker.lookup.TagLookup',
    'ephox.snooker.model.DetailsList',
    'ephox.snooker.model.Warehouse',
    'ephox.snooker.operate.Redraw',
    'ephox.snooker.resize.Adjustments',
    'ephox.snooker.resize.Bars'
  ],

  function (TagLookup, DetailsList, Warehouse, Redraw, Adjustments, Bars) {
    var run = function (container, table, cell, operation) {
      TagLookup.detect(cell).each(function (dompos) {
        var list = DetailsList.fromTable(table);

        var warehouse = Warehouse.generate(list);
        var post = operation(warehouse, dompos);

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
