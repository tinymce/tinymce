define(
  'ephox.alloy.form.TextInputSpec',

  [
    'ephox.alloy.api.behaviour.Representing',
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.spec.FormLabelSpec',
    'ephox.alloy.spec.SpecSchema',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects',
    'ephox.highway.Merger',
    'ephox.peanut.Fun',
    'ephox.sugar.api.Value'
  ],

  function (Representing, EventHandler, FormLabelSpec, SpecSchema, FieldSchema, Objects, Merger, Fun, Value) {
    var schema = [
      FieldSchema.strict('uid'),
      FieldSchema.strict('label'),
      FieldSchema.strict('components'),
      FieldSchema.option('placeholder'),
      FieldSchema.defaulted('stickyPlaceholder', false),
      FieldSchema.strict('dom'),
      FieldSchema.defaulted('inline', true),
      FieldSchema.state('originalSpec', Fun.identity),
      // FieldSchema.strict('label'),
      FieldSchema.state('builder', function () {
        return builder;
      })
    ].concat(
      SpecSchema.getPartsSchema([
        'field'
      ])
    );

    // '<alloy.form.field-input>': UiSubstitutes.single(
    //       detail.parts().field()
    //     ),
    //     '<alloy.form.field-label>': UiSubstitutes.single(
    //       Merger.deepMerge(

    var builder = function (info, _munge) {
      return Merger.deepMerge(
        info.originalSpec(),
        FormLabelSpec.make({
          uid: info.uid(),
          prefix: 'text-input',
          inline: info.inline(),
          label: {
            text: info.label()
          },
          parts: {
            field: Merger.deepMerge(
              info.parts().field(),
              {
                uid: info.partUids().field
              },
              info.placeholder().map(function (p) { return { dom: { attributes: { placeholder: p } } }; }).getOr({ }),
              {
                uiType: 'input',
                representing: { 
                  query: function (input) {
                    return Value.get(input.element());
                  },
                  set: function (input, value) {
                    Value.set(input.element(), value);
                  }
                },
                events: {
                  focusin: EventHandler.nu({
                    run: function (input) {
                      if (info.stickyPlaceholder() && Representing.getValue(input).length === 0) {
                        info.placeholder().each(function (pc) {
                          Representing.setValue(input, pc);
                        });
                      }
                    }
                  })
                }
              },
              info.inline() ? {
                dom: {
                  attributes: {
                    placeholder: info.placeholder().getOr(info.label())
                  }
                }
              } : {}
            ),
            label: Objects.readOptFrom(info.originalSpec().parts, 'label').getOr({ })
          },
          dom: info.dom(),
          components: info.components()
        })
      );
    };

    var make = function (spec, munge) {
      var info = SpecSchema.asStructOrDie('TextInputSpec.make', schema, spec, [ ]);
      return builder(info, munge);
    };

    return {
      schema: Fun.constant(schema),
      make: make
    };
  }
);