define(
  'ephox.alloy.api.ui.Input',

  [
    'ephox.alloy.registry.Tagger',
    'ephox.alloy.spec.SpecSchema',
    'ephox.boulder.api.FieldSchema',
    'ephox.highway.Merger',
    'ephox.peanut.Fun',
    'ephox.sugar.api.Value'
  ],

  function (Tagger, SpecSchema, FieldSchema, Merger, Fun, Value) {
    var schema = [
      FieldSchema.option('data'),
      FieldSchema.defaulted('type', 'input'),
      FieldSchema.defaulted('tag', 'input')
    ];

    // Dupe with Tiered Menu
    var build = function (rawSpec) {
      var spec = Merger.deepMerge({ uid: Tagger.generate('') }, rawSpec);
      var detail = SpecSchema.asStructOrDie('Input', schema, spec, [ ]);
      return make(detail, spec);
    };

    var make = function (detail, spec) {
      return {
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
      };
    };

    return {
      build: build
    };
  }
);