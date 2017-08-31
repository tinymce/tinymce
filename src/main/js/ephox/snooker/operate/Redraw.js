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

    var render = function (table, grid, newRowF, newCellF) {
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

        Arr.each(gridSection, function (row) {
          if (row.isNew()) {
            newRowF(row.element());
          }
          Arr.each(row.cells(), function (cell) {
            if (cell.isNew()) {
              newCellF(cell.element());
            }
          });
        });
      };

      var removeSection = function (sectionName) {
        SelectorFind.child(table, sectionName).bind(Remove.remove);
      };

      var renderOrRemoveSection = function (gridSection, sectionName) {
        if (gridSection.length > 0) {
          renderSection(gridSection, sectionName);
        } else {
          removeSection(sectionName);
        }
      };

      var headSection = [];
      var bodySection = [];
      var footSection = [];

      Arr.each(grid, function (row) {
        switch (row.section()) {
          case 'thead':
            headSection.push(row);
            break;
          case 'tbody':
            bodySection.push(row);
            break;
          case 'tfoot':
            footSection.push(row);
            break;
        }
      });

      renderOrRemoveSection(headSection, 'thead');
      renderOrRemoveSection(bodySection, 'tbody');
      renderOrRemoveSection(footSection, 'tfoot');
    };

    return {
      render: render
    };
  }
);
