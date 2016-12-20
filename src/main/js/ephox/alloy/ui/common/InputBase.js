define(
  'ephox.alloy.ui.common.InputBase',

  [
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects',
    'ephox.peanut.Fun',
    'ephox.sugar.api.Value'
  ],

  function (FieldSchema, Objects, Fun, Value) {
    var schema = [
      FieldSchema.option('data'),
      FieldSchema.defaulted('type', 'input'),
      FieldSchema.defaulted('tag', 'input'),
      FieldSchema.option('placeholder'),
      FieldSchema.defaulted('hasTabstop', true)
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
        },
        // FIX: Undefined
        tabstopping: detail.hasTabstop() ? true : undefined
      };
    };

    var dom = function (detail) {
      return {
        tag: detail.tag(),
        attributes: Objects.wrapAll([
          {
            key: 'type',
            value: detail.type()
          }
        ].concat(detail.placeholder().map(function (pc) {
          return {
            key: 'placeholder',
            value: pc
          };
        }).toArray()))
      };
    };

    return {
      schema: Fun.constant(schema),
      behaviours: behaviours,
      dom: dom
    };
  }
);