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
      // FieldSchema.strict('components'),
      // FieldSchema.defaulted('dom'),
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
        prefix: 'dog',
        label: {
          text: 'dog'
        },
        parts: {
          field: {
            uiType: 'input'
          },
          label: { }
        },
        dom: {
          tag: 'div'
        },
        components: [
          { uiType: 'placeholder', name: '<alloy.form.field-input>', owner: 'formlabel' },
          { uiType: 'placeholder', name: '<alloy.form.field-label>', owner: 'formlabel' }
        ]
      });
    };

    return schema;
  }
);