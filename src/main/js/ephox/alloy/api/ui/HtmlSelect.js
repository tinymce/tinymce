define(
  'ephox.alloy.api.ui.HtmlSelect',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Focusing',
    'ephox.alloy.api.behaviour.Representing',
    'ephox.alloy.api.behaviour.Tabstopping',
    'ephox.alloy.api.ui.Sketcher',
    'ephox.boulder.api.FieldSchema',
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Merger',
    'ephox.sugar.api.properties.Value'
  ],

  function (Behaviour, Focusing, Representing, Tabstopping, Sketcher, FieldSchema, Arr, Merger, Value) {
    var factory = function (detail, spec) {
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
            Behaviour.derive([
              Focusing.config({ }),
              Representing.config({
                store: {
                  mode: 'manual',
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
              }),
              detail.hasTabstop() ? Tabstopping.config({ }) : Tabstopping.revoke()
            ]),
            detail.selectBehaviours()
          )
        }
      );
    };

    return Sketcher.single({
      name: 'HtmlSelect',
      configFields: [
        FieldSchema.strict('options'),
        FieldSchema.defaulted('selectBehaviours', { }),
        FieldSchema.option('data'),
        FieldSchema.defaulted('hasTabstop', true)
      ],
      factory: factory
    });
  }
);