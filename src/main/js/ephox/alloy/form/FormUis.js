define(
  'ephox.alloy.form.FormUis',

  [
    'ephox.alloy.form.CustomRadioGroupSpec',
    'ephox.alloy.form.RadioGroupSpec',
    'ephox.alloy.form.SelectInputSpec',
    'ephox.alloy.form.TextInputSpec',
    'ephox.boulder.api.ValueSchema',
    'ephox.peanut.Fun'
  ],

  function (CustomRadioGroupSpec, RadioGroupSpec, SelectInputSpec, TextInputSpec, ValueSchema, Fun) {
    var schema = ValueSchema.choose(
      'type',
      {
        'text-input': TextInputSpec,
        'radio-group': RadioGroupSpec,
        'custom-radio-group': CustomRadioGroupSpec,
        'select-input': SelectInputSpec
      }
    );

    return {
      schema: Fun.constant(schema)
    };
  }
);