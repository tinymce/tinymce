define(
  'ephox.snooker.picker.PickerStyles',

  [
    'ephox.peanut.Fun',
    'ephox.snooker.style.Styles'
  ],

  function (Fun, Styles) {
    var table = Styles.resolve('table-picker');
    var row = Styles.resolve('table-picker-row');
    var cell = Styles.resolve('table-picker-cell');
    return {
      table: Fun.constant(table),
      row: Fun.constant(row),
      cell: Fun.constant(cell)
    };
  }
);