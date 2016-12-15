define(
  'ephox.alloy.ui.common.InputBase',

  [
    'ephox.sugar.api.Value'
  ],

  function (Value) {
    var behaviours = function (detail) {
      return {
        representing: {
          store: {
            mode: 'memory',
            initialValue: detail.data().getOr({ value: '', text: '' })
          },

          interactive: {
            event: 'input',
            process: function (input) {
              var v = Value.get(input.element());
              return {
                value: v.toLowerCase(),
                text: v
              };
            }
          },

          onSet: function (input, data) {
            Value.set(input.element(), data.text);
          }
        },

        focusing: {
          onFocus: function (component) {
            var input = component.element();
            var value = Value.get(input);
            input.dom().setSelectionRange(0, value.length);
          }
        }
      };
    };

    var dom = function (detail) {
      return {
        tag: detail.tag(),
        attributes: {
          type: detail.type()
        }
      };
    };

    return {
      behaviours: behaviours,
      dom: dom
    };
  }
);