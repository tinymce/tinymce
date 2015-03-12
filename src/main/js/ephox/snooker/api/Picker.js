define(
  'ephox.snooker.api.Picker',

  [
    'ephox.snooker.picker.PickerUi'
  ],

  function (PickerUi) {
    return function (direction, settings, fixme) {
      return PickerUi(direction, settings, fixme);
    };
  }
);
