define(
  'ephox.alloy.form.FormUis',

  [
    'ephox.alloy.form.CustomFieldSpec',
    'ephox.boulder.api.ValueSchema',
    'ephox.peanut.Fun'
  ],

  function (CustomFieldSpec, ValueSchema, Fun) {
    var schema = ValueSchema.choose(
      'type',
      {
        'custom-field': CustomFieldSpec
      }
    );

    return {
      schema: Fun.constant(schema)
    };
  }
);