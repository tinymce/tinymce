define(
  'ephox.alloy.form.TextInputSpec',

  [
    'ephox.alloy.registry.Tagger',
    'ephox.alloy.spec.FormLabelSpec',
    'ephox.boulder.api.FieldSchema'
  ],

  function (Tagger, FormLabelSpec, FieldSchema) {
    var schema = [
      FieldSchema.option('uid'),
      FieldSchema.strict('label'),
      FieldSchema.strict('components'),
      // FieldSchema.strict('components'),
      FieldSchema.strict('dom'),
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
      return FormLabelSpec.make({
        uid: info.uid().getOr(Tagger.generate('')),
        prefix: 'text-input',
        label: {
          text: info.label()
        },
        parts: {
          field: {
            uiType: 'input'
          },
          label: { }
        },
        dom: info.dom(),
        components: info.components()
      });
    };

    return schema;
  }
);