define(
  'ephox.alloy.form.CustomFieldSpec',

  [
    'ephox.alloy.spec.FormLabelSpec',
    'ephox.boulder.api.FieldSchema',
    'ephox.peanut.Fun'
  ],

  function (FormLabelSpec, FieldSchema, Fun) {
    var schema = [
      FieldSchema.state('original', Fun.identity),
      FieldSchema.state('builder', function () {
        return builder;
      })
    ];

    var builder = function (info) {
      return FormLabelSpec.make(info.original());
    };

    return schema;
  }
);