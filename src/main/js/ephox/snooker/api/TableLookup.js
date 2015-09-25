define(
  'ephox.snooker.api.TableLookup',

  [
    'ephox.peanut.Fun',
    'ephox.snooker.api.Structs',
    'ephox.sugar.api.Attr',
    'ephox.sugar.api.SelectorFilter',
    'ephox.sugar.api.SelectorFind',
    'ephox.sugar.api.Traverse',
    'global!parseInt'
  ],

  function (Fun, Structs, Attr, SelectorFilter, SelectorFind, Traverse, parseInt) {
    /*
     * Identify the optional cell that element represents.
     */
    var cell = function (element, isRoot) {
      return SelectorFind.closest(element, 'td,th', isRoot);
    };

    var cells = function (ancestor) {
      return SelectorFilter.descendants(ancestor, 'th,td');
    };

    var neighbours = function (selector, element) {
      return Traverse.parent(element).map(function (parent) {
        return SelectorFilter.children(parent, selector);
      });
    };

    var neighbourCells = Fun.curry(neighbours, 'th,td');
    var neighbourRows  = Fun.curry(neighbours, 'tr');

    var firstCell = function (ancestor) {
      return SelectorFind.descendant(ancestor, 'th,td');
    };

    var table = function (element, isRoot) {
      return SelectorFind.closest(element, 'table', isRoot);
    };

    var row = function (element, isRoot) {
      return SelectorFind.closest(element, 'tr', isRoot);
    };

    var rows = function (ancestor) {
      return SelectorFilter.descendants(ancestor, 'tr');
    };

    var attr = function (element, property) {
      return parseInt(Attr.get(element, property), 10);
    };

    var grid = function (element, rowProp, colProp) {
      var rows = attr(element, rowProp);
      var cols = attr(element, colProp);
      return Structs.grid(rows, cols);
    };

    return {
      cell: cell,
      firstCell: firstCell,
      cells: cells,
      neighbourCells: neighbourCells,
      table: table,
      row: row,
      rows: rows,
      neighbourRows: neighbourRows,
      attr: attr,
      grid: grid
    };
  }
);
