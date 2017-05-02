define(
  'ephox.alloy.behaviour.pinching.PinchingSchema',

  [
    'ephox.boulder.api.FieldSchema'
  ],

  function (FieldSchema) {
    return [
      FieldSchema.strict('onPinch'),
      FieldSchema.strict('onPunch')
    ];
  }
);