define(
  'ephox.snooker.api.TableLookup',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.snooker.api.Structs',
    'ephox.sugar.api.Attr',
    'ephox.sugar.api.Node',
    'ephox.sugar.api.SelectorFilter',
    'ephox.sugar.api.SelectorFind',
    'ephox.sugar.api.Traverse',
    'global!parseInt'
  ],

  function (Arr, Fun, Option, Structs, Attr, Node, SelectorFilter, SelectorFind, Traverse, parseInt) {
    var lookup = function (tags, element) {
      return Arr.contains(tags, Node.name(element)) ? Option.some(element) : SelectorFind.ancestor(element, tags.join(','));
    };

    /*
     * Identify the optional cell that element represents.
     */
    var cell = function (element) {
      return lookup([ 'td', 'th' ], element);
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

    var table = function (element) {
      return lookup([ 'table' ], element);
    };

    var row = function (element) {
      return lookup([ 'tr' ], element);
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
