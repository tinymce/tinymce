define(
  'ephox.snooker.operate.Redraw',

  [
    'ephox.compass.Arr',
    'ephox.syrup.api.Attr',
    'ephox.syrup.api.Element',
    'ephox.syrup.api.Insert',
    'ephox.syrup.api.InsertAll',
    'ephox.syrup.api.Remove',
    'ephox.syrup.api.SelectorFind',
    'ephox.syrup.api.Traverse'
  ],

  function (Arr, Attr, Element, Insert, InsertAll, Remove, SelectorFind, Traverse) {
    var setIfNot = function (element, property, value, ignore) {
      if (value === ignore) Attr.remove(element, property);
      else Attr.set(element, property, value);
    };

    var render = function (table, grid) {
      var renderSection = function (gridSection, sectionName) {
        var section = SelectorFind.child(table, sectionName).getOrThunk(function () {
          var tb = Element.fromTag(sectionName, Traverse.owner(table).dom());
          Insert.append(table, tb);
          return tb;
        });

        Remove.empty(section);

        var rows = Arr.map(gridSection, function (row) {
          var tr = row.element();
          Remove.empty(tr);
          Arr.each(row.cells(), function (cell) {
            setIfNot(cell.element(), 'colspan', cell.colspan(), 1);
            setIfNot(cell.element(), 'rowspan', cell.rowspan(), 1);
            Insert.append(tr, cell.element());
          });
          return tr;
        });

        InsertAll.append(section, rows);
      };

      var removeSection = function (sectionName) {
        SelectorFind.child(table, sectionName).bind(Remove.remove);
      };

      var renderOrRemoveSection = function (grid, sectionName) {
        var gridSection = Arr.filter(grid, function (row) {
          return row.section() === sectionName;
        });

        if (gridSection.length > 0) {
          renderSection(gridSection, sectionName);
        } else {
          removeSection(sectionName);
        }
      };

      renderOrRemoveSection(grid, 'thead');
      renderOrRemoveSection(grid, 'tbody');
      renderOrRemoveSection(grid, 'tfoot');
    };

    return {
      render: render
    };
  }
);
