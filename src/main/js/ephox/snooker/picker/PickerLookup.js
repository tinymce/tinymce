define(
  'ephox.snooker.picker.PickerLookup',

  [
    'ephox.snooker.api.Structs',
    'ephox.snooker.picker.PickerStyles',
    'ephox.sugar.api.Attr',
    'ephox.sugar.api.SelectorFilter',
    'global!parseInt'
  ],

  function (Structs, PickerStyles, Attr, SelectorFilter, parseInt) {
    var CELL_SELECTOR = '.' + PickerStyles.cell();
    var ROW_SELECTOR = '.' + PickerStyles.row();

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

    return {
      cells: cells,
      rows: rows,
      grid: grid
    };
  }
);
