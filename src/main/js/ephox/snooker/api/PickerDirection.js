define(
  'ephox.snooker.api.PickerDirection',

  [
    'ephox.peanut.Fun',
    'ephox.snooker.picker.CellPosition'
  ],

  function (Fun, CellPosition) {
    var ltr = {
      pickerCell: CellPosition.findCellLtr,
      isRtl: Fun.constant(false)
    };

    var rtl = {
      pickerCell: CellPosition.findCellRtl,
      isRtl: Fun.constant(true)
    };

    return {
      ltr: ltr,
      rtl: rtl
    };
  }
);