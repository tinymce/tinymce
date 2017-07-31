define(
  'ephox.snooker.model.DetailsList',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.snooker.api.Structs',
    'ephox.snooker.api.TableLookup',
    'ephox.syrup.api.Attr',
    'ephox.syrup.api.Node',
    'ephox.syrup.api.Traverse'
  ],

  function (Arr, Fun, Structs, TableLookup, Attr, Node, Traverse) {

    /*
     * Takes a DOM table and returns a list of list of:
       element: row element
       cells: (id, rowspan, colspan) structs
     */
    var fromTable = function (table) {
      var rows = TableLookup.rows(table);
      return Arr.map(rows, function (row) {
        var element = row;

        var parent = Traverse.parent(element);
        var parentSection = parent.bind(function (parent) {
          var parentName = Node.name(parent);
          return (parentName === 'tfoot' || parentName === 'thead' || parentName === 'tbody') ? parentName : 'tbody';
        });

        var cells = Arr.map(TableLookup.cells(row), function (cell) {
          var rowspan = Attr.has(cell, 'rowspan') ? parseInt(Attr.get(cell, 'rowspan'), 10) : 1;
          var colspan = Attr.has(cell, 'colspan') ? parseInt(Attr.get(cell, 'colspan'), 10) : 1;
          return Structs.detail(cell, rowspan, colspan);
        });

        return {
          element: Fun.constant(element),
          section: Fun.constant(parentSection),
          cells: Fun.constant(cells)
        };
      });
    };

    return {
      fromTable: fromTable
    };
  }
);
