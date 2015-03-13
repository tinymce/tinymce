define(
  'ephox.snooker.api.Picker',

  [
    'ephox.snooker.picker.PickerUi'
  ],

  function (PickerUi) {
    return function (direction, settings, helpReference) {
      return PickerUi(direction, settings, helpReference);
    };
  }
);
