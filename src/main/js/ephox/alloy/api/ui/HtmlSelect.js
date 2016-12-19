define(
  'ephox.alloy.api.ui.HtmlSelect',

  [
    'ephox.alloy.api.ui.UiBuilder',
    'ephox.alloy.data.Fields',
    'ephox.boulder.api.FieldSchema',
    'ephox.compass.Arr',
    'ephox.highway.Merger',
    'ephox.peanut.Fun',
    'ephox.perhaps.Result',
    'ephox.sugar.api.TextContent',
    'ephox.sugar.api.Value'
  ],

  function (UiBuilder, Fields, FieldSchema, Arr, Merger, Fun, Result, TextContent, Value) {
    var schema = [
      FieldSchema.strict('options'),
      Fields.members([ 'option' ]),
      FieldSchema.option('data'),
      FieldSchema.defaulted('hasTabstop', true)
    ];

    // Dupe with Tiered Menu
    var build = function (spec) {
      return UiBuilder.single('html-select', schema, make, spec);
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
            focusing: true,
            representing: {
              extractValue: function (comp, data) {
                // See if there is something that matches value
                var matching = Arr.find(detail.options(), function (opt) {
                  return opt.value === data.value;
                });

                console.log('matching', matching);

                // FIX: Update with katamari
                return matching !== undefined && matching !== null ? Result.value(matching) : Result.error('Not found');
              },

              interactive: {
                event: 'input',
                process: function (comp) {
                  return {
                    value: Value.get(comp.element()),
                    text: TextContent.get(comp.element())
                  };
                }
              },

              onSet: function (comp, data) {
                console.log('data', data.value);
                Value.set(comp.element(), data.value);
              },

              store: {
                mode: 'memory',
                // TODO: Check this
                initialValue: detail.data().getOr(detail.options()[0]),
                
              }
            },

            // FIX: Undefined
            tabstopping: detail.hasTabstop() ? true : undefined
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