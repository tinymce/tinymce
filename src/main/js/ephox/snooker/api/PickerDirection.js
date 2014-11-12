define(
  'ephox.snooker.api.PickerDirection',

  [
    'ephox.snooker.picker.CellPosition'
  ],

  function (CellPosition) {
    var ltr = {
      pickerCell: CellPosition.findCellLtr
    };

    var rtl = {
      pickerCell: CellPosition.findCellRtl
    };

    return {
      ltr: ltr,
      rtl: rtl
    }
  }
);