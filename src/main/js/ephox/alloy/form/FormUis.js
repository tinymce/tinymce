define(
  'ephox.alloy.form.FormUis',

  [
    'ephox.alloy.form.CoupledTextInputSpec',
    'ephox.alloy.form.CustomFieldSpec',
    'ephox.alloy.form.SelectInputSpec',
    'ephox.alloy.form.TextInputSpec',
    'ephox.boulder.api.ValueSchema',
    'ephox.peanut.Fun'
  ],

  function (CoupledTextInputSpec, CustomFieldSpec, SelectInputSpec, TextInputSpec, ValueSchema, Fun) {
    var schema = ValueSchema.choose(
      'type',
      {
        'coupled-text-input': CoupledTextInputSpec,
        'custom-field': CustomFieldSpec
      }
    );

    return {
      schema: Fun.constant(schema)
    };
  }
);