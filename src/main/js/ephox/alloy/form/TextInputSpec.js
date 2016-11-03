define(
  'ephox.alloy.form.TextInputSpec',

  [
    'ephox.alloy.spec.FormLabelSpec',
    'ephox.alloy.spec.SpecSchema',
    'ephox.boulder.api.FieldSchema',
    'ephox.highway.Merger',
    'ephox.peanut.Fun',
    'ephox.sugar.api.Value'
  ],

  function (FormLabelSpec, SpecSchema, FieldSchema, Merger, Fun, Value) {
    var schema = [
      FieldSchema.strict('uid'),
      FieldSchema.strict('label'),
      FieldSchema.strict('components'),
      FieldSchema.option('placeholder'),
      FieldSchema.strict('dom'),
      FieldSchema.defaulted('inline', true),
      FieldSchema.state('originalSpec', Fun.identity),
      // FieldSchema.strict('label'),
      FieldSchema.state('builder', function () {
        return builder;
      })
    ];

    // '<alloy.form.field-input>': UiSubstitutes.single(
    //       detail.parts().field()
    //     ),
    //     '<alloy.form.field-label>': UiSubstitutes.single(
    //       Merger.deepMerge(

    var builder = function (info) {
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
            label: { }
          },
          dom: info.dom(),
          components: info.components()
        })
      );
    };

    var make = function (spec) {
      var info = SpecSchema.asStructOrDie('TextInputSpec.make', schema, spec, [ ]);
      return builder(info);
    };

    return {
      schema: Fun.constant(schema),
      make: make
    };
  }
);