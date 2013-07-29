define(
  'ephox.snooker.demo.PickerDemo',

  [
    'ephox.snooker.picker.Picker',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Insert',
    'global!Math'
  ],

  function (Picker, Element, Insert, Math) {
    return function () {
      console.log('hello world');

      var picker = Picker();
      var ephoxUi = Element.fromDom(document.getElementById('ephox-ui'));

      Insert.append(ephoxUi, picker.element());

      var val = 3;

      setInterval(function () {
        val++;
        picker.setSize(val, val);

        picker.setSelection( Math.ceil(Math.random() * val) ,Math.ceil(Math.random() * val));
      }, 1000);
    };
  }
);
