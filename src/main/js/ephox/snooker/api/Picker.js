define(
  'ephox.snooker.api.Picker',

  [
    'ephox.snooker.picker.PickerUi'
  ],

  function (PickerUi) {
    return function (settings, direction) {
      return PickerUi(settings, direction);
    };
  }
);
