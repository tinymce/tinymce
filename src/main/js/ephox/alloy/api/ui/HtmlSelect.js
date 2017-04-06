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
    var schema = HtmlSelectSchema.schema();

    // Dupe with Tiered Menu
    var sketch = function (spec) {
      return UiSketcher.single(HtmlSelectSchema.name(), schema, make, spec);
    };

    var make = function (detail, spec) {
      var options = Arr.map(detail.options(), function (option) {
        return {
          dom: {
            tag: 'option',
            value: option.value,
            innerHtml: option.text
          }
        };
      });

      return Merger.deepMerge(
        {
          uid: detail.uid(),
          dom: {
            tag: 'select'
          },
          components: options,
          behaviours: Merger.deepMerge(
            {
              focusing: true,
              representing: {
                store: {
                  mode: 'manual'      ,
                  getValue: function (select) {
                    return Value.get(select.element());
                  },
                  setValue: function (select, newValue) {
                    // This is probably generically useful ... may become a part of Representing.
                    var found = Arr.find(detail.options(), function (opt) {
                      return opt.value === newValue;
                    });
                    if (found.isSome()) Value.set(select.element(), newValue);
                  }   
                }
              },
              tabstopping: detail.hasTabstop() ? true : Behaviour.revoke()
            },
            detail.selectBehaviours()
          )
        }
      );
    };

    return {
      sketch: sketch,
      name: Fun.constant(HtmlSelectSchema.name())
    };
  }
);