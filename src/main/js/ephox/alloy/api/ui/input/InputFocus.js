define(
  'ephox.alloy.api.ui.input.InputFocus',

  [
    'ephox.alloy.api.behaviour.Focusing',
    'ephox.sugar.api.Value'
  ],

  function (Focusing, Value) {
    var selectAll = {
      key: Focusing.name(),
      value: {
        onFocus: function (component) {
          var input = component.element();
          var value = Value.get(input);
          input.dom().setSelectionRange(0, value.length);
        }
      }
    };

    return {
      selectAll: selectAll
    };
  }
);