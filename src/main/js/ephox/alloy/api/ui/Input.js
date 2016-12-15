define(
  'ephox.alloy.api.ui.Input',

  [
    'ephox.alloy.api.ui.UiBuilder',
    'ephox.boulder.api.FieldSchema',
    'ephox.highway.Merger',
    'ephox.peanut.Fun',
    'ephox.sugar.api.Value'
  ],

  function (UiBuilder, FieldSchema, Merger, Fun, Value) {
    var schema = [
      FieldSchema.option('data'),
      FieldSchema.defaulted('type', 'input'),
      FieldSchema.defaulted('tag', 'input')
    ];

    var build = function (spec) {
      return UiBuilder.single('Input', schema, make, spec);
    };

    var make = function (detail, spec) {
      return Merger.deepMerge(spec, {
        uid: detail.uid(),
        uiType: 'custom',
        dom: {
          tag: detail.tag(),
          attributes: {
            type: detail.type()
          }
        },
        // No children.
        components: [ ],
        behaviours: {
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
        }
      });
    };

    return {
      build: build,
      name: Fun.constant('input')
    };
  }
);