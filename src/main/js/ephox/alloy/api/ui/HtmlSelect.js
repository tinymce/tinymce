define(
  'ephox.alloy.api.ui.HtmlSelect',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.ui.UiSketcher',
    'ephox.alloy.data.Fields',
    'ephox.alloy.ui.schema.HtmlSelectSchema',
    'ephox.boulder.api.FieldSchema',
    'ephox.compass.Arr',
    'ephox.highway.Merger',
    'ephox.peanut.Fun',
    'ephox.perhaps.Result',
    'ephox.sugar.api.TextContent',
    'ephox.sugar.api.Value'
  ],

  function (Behaviour, UiSketcher, Fields, HtmlSelectSchema, FieldSchema, Arr, Merger, Fun, Result, TextContent, Value) {
    var schema = HtmlSelectSchema.schema()

    // Dupe with Tiered Menu
    var sketch = function (spec) {
      return UiSketcher.single(HtmlSelectSchema.name(), schema, make, spec);
    };

    var make = function (detail, spec) {
      var options = Arr.map(detail.options(), function (option) {
        return Merger.deepMerge(
          detail.members().option().munge()(option),
          {
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

                // TODO: Update when using katamari
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
                Value.set(comp.element(), data.value);
              },

              store: {
                mode: 'memory',
                // TODO: Check this
                initialValue: detail.data().getOr(detail.options()[0])
                
              }
            },

            tabstopping: detail.hasTabstop() ? true : Behaviour.revoke()
          }
        }
      );
    };

    return {
      sketch: sketch,
      name: Fun.constant(HtmlSelectSchema.name())
    };
  }
);