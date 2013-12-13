define(
  'ephox.snooker.tbio.TableOperation',

  [
    'ephox.compass.Arr',
    'ephox.scullion.Struct',
    'ephox.snooker.tbio.Aq',
    'ephox.snooker.tbio.query.Lookup',
    'ephox.snooker.tbio.resize.bar.Bars',
    'ephox.sugar.api.Attr',
    'ephox.sugar.api.Compare',
    'ephox.sugar.api.Css',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Insert',
    'ephox.sugar.api.InsertAll',
    'ephox.sugar.api.Remove',
    'ephox.sugar.api.SelectorFind',
    'ephox.sugar.api.Traverse'
  ],

  function (Arr, Struct, Aq, Lookup, Bars, Attr, Compare, Css, Element, Insert, InsertAll, Remove, SelectorFind, Traverse) {

    var render = function (table, information) {
      var tbody = SelectorFind.child(table, 'tbody').getOrDie();
      Remove.empty(tbody);

      // TODO: But if I do it this way, I'll lose the styling on the row. Row will have to have an id and cells.
      // I'll need to add that later.
      var rows = Arr.map(information, function (row) {
        var tr = Element.fromTag('tr');
        Arr.each(row, function (cell) {
          Attr.set(cell.id(), 'colspan', cell.colspan());
          Attr.set(cell.id(), 'rowspan', cell.rowspan());
          Insert.append(tr, cell.id());
        });
        return tr;
      });

      InsertAll.append(tbody, rows);
    };

    var grid = Struct.immutable('row', 'column');

    var detect = function (cell) {
      var getIndex = function (elem) {
        return Traverse.parent(elem).map(function (parent) {
          var children = Traverse.children(parent);
          return Arr.findIndex(children, function (child) {
            return Compare.eq(child, elem);
          });
        });
      };

      return getIndex(cell).bind(function (colId) {
        return SelectorFind.ancestor(cell, 'tr').bind(getIndex).map(function (rowId) {
          return grid(rowId, colId);
        });
      });
    };

    var adjustWidths = function (information) {
      var widths = Lookup.widths(information);
      var numbers = Arr.map(widths, function (x) {
        return parseInt(x, 10);
      });

      var newValues = Aq.aq(information, numbers);
      Arr.each(newValues, function (v) {
        Css.set(v.id(), 'width', v.width() + 'px');
      });
    };

    var run = function (container, table, cell, operation) {
      detect(cell).each(function (gridpos) {
        var initial = Lookup.information(table);
        var post = operation(initial, gridpos);

        render(table, post);
        adjustWidths(post);
        Bars.refresh(container, table);
      });
    };

    return {
      run: run
    };
  }
);
