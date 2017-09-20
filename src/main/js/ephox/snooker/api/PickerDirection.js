define(
  'ephox.snooker.api.PickerDirection',

  [
    'ephox.katamari.api.Fun',
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