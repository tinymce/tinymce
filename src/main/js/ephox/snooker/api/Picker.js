define(
  'ephox.snooker.api.Picker',

  [
    'ephox.snooker.picker.PickerUi'
  ],

  function (PickerUi) {
    return function (direction, settings) {
      return PickerUi(direction, settings);
    };
  }
);
