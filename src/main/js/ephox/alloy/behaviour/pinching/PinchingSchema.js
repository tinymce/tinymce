define(
  'ephox.alloy.behaviour.pinching.PinchingSchema',

  [
    'ephox.alloy.dragging.common.DragState',
    'ephox.boulder.api.FieldSchema'
  ],

  function (DragState, FieldSchema) {
    return [
      FieldSchema.strict('onPinch'),
      FieldSchema.strict('onPunch'),
      FieldSchema.state('state', DragState)
    ];
  }
);