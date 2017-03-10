define(
  'ephox.alloy.ui.slider.SliderSchema',

  [
    'ephox.boulder.api.FieldSchema',
    'ephox.katamari.api.Cell',
    'ephox.katamari.api.Fun'
  ],

  function (FieldSchema, Cell, Fun) {
    return [
      FieldSchema.strict('min'),
      FieldSchema.strict('max'),
      FieldSchema.defaulted('stepSize', 1),
      FieldSchema.defaulted('onChange', Fun.noop),
      FieldSchema.defaulted('snapToGrid', false),
      FieldSchema.strict('initialValue'),
      
      FieldSchema.state('value', function (spec) { return Cell(spec.initialValue); })
    ];
  }
);