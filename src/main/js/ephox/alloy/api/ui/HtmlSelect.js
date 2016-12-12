define(
  'ephox.alloy.api.ui.HtmlSelect',

  [
    'ephox.alloy.data.Fields',
    'ephox.alloy.registry.Tagger',
    'ephox.alloy.spec.SpecSchema',
    'ephox.boulder.api.FieldSchema',
    'ephox.compass.Arr',
    'ephox.highway.Merger',
    'ephox.peanut.Fun',
    'ephox.sugar.api.TextContent',
    'ephox.sugar.api.Value'
  ],

  function (Fields, Tagger, SpecSchema, FieldSchema, Arr, Merger, Fun, TextContent, Value) {
    var schema = [
      FieldSchema.strict('options'),
      Fields.members([ 'option' ]),
      FieldSchema.option('data')
    ];

    // Dupe with Tiered Menu
    var build = function (rawSpec) {
      var spec = Merger.deepMerge({ uid: Tagger.generate('') }, rawSpec);
      var detail = SpecSchema.asStructOrDie('html-select', schema, spec, [ ]);
      return make(detail, spec);
    };

    var make = function (detail, spec) {
      var options = Arr.map(detail.options(), function (option) {
        return Merger.deepMerge(
          detail.members().option().munge(option),
          {
            uiType: 'custom',
            dom: {
              tag: 'option',
              value: option.value,
              innerHtml: option.text
            }
          }
        );
      });


      return Merger.deepMerge(
        spec,
        {
          dom: {
            tag: 'select'
          },
          components: options,
          behaviours: {
            representing: {
              store: {
                mode: 'memory',
                // TODO: Check this
                initialValue: detail.data().getOr(detail.options()[0]),
                interactive: {
                  event: 'input',
                  process: function (comp) {
                    return {
                      value: Value.get(comp.element()),
                      text: TextContent.get(comp.element())
                    };
                  }
                },

                isValidValue: function (comp, data) {
                  // See if there is something that matches value
                  var matching = Arr.find(detail.options(), function (opt) {
                    return opt.value === data.value;
                  });

                  // FIX: Update with katamari
                  return matching !== undefined && matching !== null;
                },

                onSet: function (comp, data) {
                  Value.set(comp.element(), data.value);
                }
              }
            }
          }
        }
      );
    };

    return {
      build: build,
      name: Fun.constant('html-select')
    };
  }
);