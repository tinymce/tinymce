define(
  'ephox.snooker.api.TableLookup',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.snooker.api.Structs',
    'ephox.snooker.picker.PickerStyles',
    'ephox.sugar.api.Attr',
    'ephox.sugar.api.Node',
    'ephox.sugar.api.SelectorFilter',
    'ephox.sugar.api.SelectorFind',
    'ephox.sugar.api.Traverse',
    'global!parseInt'
  ],

  function (Arr, Fun, Option, Structs, PickerStyles, Attr, Node, SelectorFilter, SelectorFind, Traverse, parseInt) {
    var CELL_SELECTOR = '.' + PickerStyles.cell();
    var ROW_SELECTOR = '.' + PickerStyles.row();
    var TABLE_SELECTOR = '.' + PickerStyles.table();

    /*
     * Identify the optional cell that element represents.
     */
    var cell = function (element) {
      return SelectorFind.closest(element, CELL_SELECTOR);
    };

    var cells = function (ancestor) {
      return SelectorFilter.descendants(ancestor, CELL_SELECTOR);
    };

    var neighbours = function (selector, element) {
      return Traverse.parent(element).map(function (parent) {
        return SelectorFilter.children(parent, selector);
      });
    };

    var neighbourCells = Fun.curry(neighbours, CELL_SELECTOR);
    var neighbourRows  = Fun.curry(neighbours, ROW_SELECTOR);

    var firstCell = function (ancestor) {
      return SelectorFind.descendant(ancestor, CELL_SELECTOR);
    };

    var table = function (element) {
      return SelectorFind.closest(element, TABLE_SELECTOR);
    };

    var row = function (element) {
      return SelectorFind.closest(element, ROW_SELECTOR);
    };

    var rows = function (ancestor) {
      return SelectorFilter.descendants(ancestor, ROW_SELECTOR);
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
