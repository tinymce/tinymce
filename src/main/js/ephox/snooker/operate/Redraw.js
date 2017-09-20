define(
  'ephox.snooker.operate.Redraw',

  [
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Fun',
    'ephox.sugar.api.properties.Attr',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.dom.Insert',
    'ephox.sugar.api.dom.InsertAll',
    'ephox.sugar.api.dom.Remove',
    'ephox.sugar.api.dom.Replication',
    'ephox.sugar.api.search.SelectorFind',
    'ephox.sugar.api.search.Traverse'
  ],

  function (Arr, Fun, Attr, Element, Insert, InsertAll, Remove, Replication, SelectorFind, Traverse) {
    var setIfNot = function (element, property, value, ignore) {
      if (value === ignore) Attr.remove(element, property);
      else Attr.set(element, property, value);
    };

    var render = function (table, grid) {
      var newRows = [];
      var newCells = [];

      var renderSection = function (gridSection, sectionName) {
        var section = SelectorFind.child(table, sectionName).getOrThunk(function () {
          var tb = Element.fromTag(sectionName, Traverse.owner(table).dom());
          Insert.append(table, tb);
          return tb;
        });

        Remove.empty(section);

        var rows = Arr.map(gridSection, function (row) {
          if (row.isNew()) {
            newRows.push(row.element());
          }
          var tr = row.element();
          Remove.empty(tr);
          Arr.each(row.cells(), function (cell) {
            if (cell.isNew()) {
              newCells.push(cell.element());
            }
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

      return {
        newRows: Fun.constant(newRows),
        newCells: Fun.constant(newCells)
      };
    };

    var copy = function (grid) {
      var rows = Arr.map(grid, function (row) {
        // Shallow copy the row element
        var tr = Replication.shallow(row.element());
        Arr.each(row.cells(), function (cell) {
          var clonedCell = Replication.deep(cell.element());
          setIfNot(clonedCell, 'colspan', cell.colspan(), 1);
          setIfNot(clonedCell, 'rowspan', cell.rowspan(), 1);
          Insert.append(tr, clonedCell);
        });
        return tr;
      });
      return rows;
    };

    return {
      render: render,
      copy: copy
    };
  }
);
