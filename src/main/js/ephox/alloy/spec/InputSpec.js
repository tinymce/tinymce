define(
  'ephox.alloy.spec.InputSpec',

  [
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects',
    'ephox.boulder.api.ValueSchema',
    'ephox.compass.Arr',
    'ephox.sugar.api.Value'
  ],

  function (FieldSchema, Objects, ValueSchema, Arr, Value) {
    // This is not fleshed out yet.
    var schema = ValueSchema.objOf([
      FieldSchema.defaulted('classes', [ ]),
      FieldSchema.option('value'),
      FieldSchema.option('placeholder'),
      FieldSchema.defaulted('type', 'input'),
      FieldSchema.defaulted('tabstop', true)
    ]);

    var make = function (spec) {
      var detail = ValueSchema.asStructOrDie('input.spec', schema, spec);

      var toProp = function (opt, name) {
        return opt.map(function (v) {
          return [ { key: name, value: v } ];
        }).getOr([ ]);
      };

      return {
        uiType: 'custom',
        // Simplify this
        dom: Objects.wrapAll(
          Arr.flatten([
            toProp(detail.value(), 'value'),
            [
              { key: 'tag', value: 'input' },
              { key: 'type', value: detail.type() },
              {
                key: 'attributes',
                value: Objects.wrapAll(
                  Arr.flatten([
                    toProp(detail.placeholder(), 'placeholder')
                  ])
                )
              }
            ]
          ])
        ),

        tabstopping: detail.tabstop(),
        focusing: {
          onFocus: function (component) {
            var input = component.element();
            var value = Value.get(input);
            input.dom().setSelectionRange(0, value.length);
          }
        }
      };
    };

    return {
      make: make
    };
  }
);