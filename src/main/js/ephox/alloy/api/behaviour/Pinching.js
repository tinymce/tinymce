define(
  'ephox.alloy.api.behaviour.Pinching',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.behaviour.pinching.ActivePinching',
    'ephox.alloy.behaviour.pinching.PinchingSchema'
  ],

  function (Behaviour, ActivePinching, PinchingSchema) {
    return Behaviour.create(
      PinchingSchema,
      'pinching',
      ActivePinching,
      { },
      { }
    );
  }
);