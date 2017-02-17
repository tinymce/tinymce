define(
  'ephox.alloy.api.ui.HtmlSelect',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.ui.UiSketcher',
    'ephox.alloy.ui.schema.HtmlSelectSchema',
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Merger',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Result',
    'ephox.sugar.api.properties.TextContent',
    'ephox.sugar.api.properties.Value'
  ],

  function (Behaviour, UiSketcher, HtmlSelectSchema, Arr, Merger, Fun, Result, TextContent, Value) {
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
                return Arr.find(detail.options(), function (opt) {
                  return opt.value === data.value;
                }).fold(function () {
                  return Result.error('Not found');
                }, Result.value);
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