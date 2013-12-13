define(
  'ephox.snooker.ready.operate.TableOperation',

  [
    'ephox.snooker.ready.lookup.TagLookup',
    'ephox.snooker.ready.model.DetailsList',
    'ephox.snooker.ready.operate.Redraw',
    'ephox.snooker.ready.resize.Adjustments',
    'ephox.snooker.ready.resize.Bars'
  ],

  function (TagLookup, DetailsList, Redraw, Adjustments, Bars) {
    var run = function (container, table, cell, operation) {
      TagLookup.detect(cell).each(function (gridpos) {
        var initial = DetailsList.fromTable(table);
        var post = operation(initial, gridpos);

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
