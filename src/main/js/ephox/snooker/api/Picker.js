define(
  'ephox.snooker.api.Picker',

  [
    'ephox.snooker.picker.PickerUi'
  ],

  function (PickerUi) {
    return function (settings) {
      return PickerUi(settings);
    };
  }
);
