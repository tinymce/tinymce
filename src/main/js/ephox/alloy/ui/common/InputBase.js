define(
  'ephox.alloy.ui.common.InputBase',

  [
    'ephox.boulder.api.FieldSchema',
    'ephox.peanut.Fun',
    'ephox.sugar.api.Value'
  ],

  function (FieldSchema, Fun, Value) {
    var schema = [
      FieldSchema.option('data'),
      FieldSchema.defaulted('type', 'input'),
      FieldSchema.defaulted('tag', 'input')
    ];

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
      schema: Fun.constant(schema),
      behaviours: behaviours,
      dom: dom
    };
  }
);