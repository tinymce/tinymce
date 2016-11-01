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

    var builder = function (info) {
      return FormLabelSpec.make({
        uid: info.uid().getOr(Tagger.generate('')),
        prefix: 'dog',
        label: {
          text: 'dog'
        },
        field: {
          uiType: 'input'
        }
      });
    };

    return schema;
  }
);