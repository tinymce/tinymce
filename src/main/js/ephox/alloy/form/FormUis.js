define(
  'ephox.alloy.form.FormUis',

  [
    'ephox.alloy.form.CoupledTextInputSpec',
    'ephox.alloy.form.CustomFieldSpec',
    'ephox.alloy.form.CustomRadioGroupSpec',
    'ephox.alloy.form.RadioGroupSpec',
    'ephox.alloy.form.SelectInputSpec',
    'ephox.alloy.form.TextInputSpec',
    'ephox.boulder.api.ValueSchema',
    'ephox.peanut.Fun'
  ],

  function (CoupledTextInputSpec, CustomFieldSpec, CustomRadioGroupSpec, RadioGroupSpec, SelectInputSpec, TextInputSpec, ValueSchema, Fun) {
    var schema = ValueSchema.choose(
      'type',
      {
        'coupled-text-input': CoupledTextInputSpec,
        'text-input': TextInputSpec.schema(),
        'radio-group': RadioGroupSpec,
        'custom-radio-group': CustomRadioGroupSpec,
        'select-input': SelectInputSpec,
        'custom-field': CustomFieldSpec
      }
    );

    return {
      schema: Fun.constant(schema)
    };
  }
);