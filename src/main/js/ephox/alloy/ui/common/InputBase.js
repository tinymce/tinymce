define(
  'ephox.alloy.ui.common.InputBase',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects',
    'ephox.katamari.api.Fun',
    'ephox.sugar.api.properties.Value'
  ],

  function (Behaviour, FieldSchema, Objects, Fun, Value) {
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
            mode: 'manual',
            // Propagating its Option
            initialValue: detail.data().getOr(undefined),
            getValue: function (input) {
              return Value.get(input.element());
            },
            setValue: function (input, data) {
              var current = Value.get(input.element());
              // Only set it if it has changed ... otherwise the cursor goes to the end.
              if (current !== data) {
                Value.set(input.element(), data);
              }
            }
          }
        },

        focusing: {
          onFocus: function (component) {
            var input = component.element();
            var value = Value.get(input);
            input.dom().setSelectionRange(0, value.length);
          }
        },
        tabstopping: detail.hasTabstop() ? true : Behaviour.revoke()
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