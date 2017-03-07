define(
  'ephox.snooker.picker.PickerLookup',

  [
    'ephox.snooker.api.Structs',
    'ephox.snooker.picker.PickerStyles',
    'ephox.sugar.api.Attr',
    'ephox.sugar.api.SelectorFilter',
    'ephox.sugar.api.SelectorFind',
    'global!parseInt'
  ],

  function (Structs, PickerStyles, Attr, SelectorFilter, SelectorFind, parseInt) {
    var CELL_SELECTOR = '.' + PickerStyles.cell();
    var ROW_SELECTOR = '.' + PickerStyles.row();

    // TODO: refactor to build up references at picker creation time (PickerUi.recreate)

    var cells = function (ancestor) {
      return SelectorFilter.descendants(ancestor, CELL_SELECTOR);
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

    var button = function (cell) {
      return SelectorFind.child(cell, '.' + PickerStyles.button()).getOr(cell);
    };

    return {
      cells: cells,
      rows: rows,
      grid: grid,
      button: button
    };
  }
);
