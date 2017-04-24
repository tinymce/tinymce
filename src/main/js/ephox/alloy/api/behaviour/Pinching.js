define(
  'ephox.alloy.api.behaviour.Pinching',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.behaviour.pinching.ActivePinching',
    'ephox.alloy.behaviour.pinching.PinchingSchema',
    'ephox.alloy.dragging.common.DragState'
  ],

  function (Behaviour, ActivePinching, PinchingSchema, DragState) {
    return Behaviour.create(
      PinchingSchema,
      'pinching',
      ActivePinching,
      { },
      { },
      DragState
    );
  }
);