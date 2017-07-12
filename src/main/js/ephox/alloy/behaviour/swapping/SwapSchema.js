define(
  'ephox.alloy.behaviour.swapping.SwapSchema',

  [
    'ephox.boulder.api.FieldSchema'
  ],

  function (FieldSchema) {
    return [
      FieldSchema.strict('alpha'),
      FieldSchema.strict('omega')
    ];
  }
);
