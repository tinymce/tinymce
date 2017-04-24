define(
  'ephox.alloy.api.behaviour.Positioning',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.behaviour.common.NoState',
    'ephox.alloy.behaviour.positioning.ActivePosition',
    'ephox.alloy.behaviour.positioning.PositionApis',
    'ephox.alloy.behaviour.positioning.PositionSchema'
  ],

  function (Behaviour, NoState, ActivePosition, PositionApis, PositionSchema) {
    return Behaviour.create(
      PositionSchema,
      'positioning',
      ActivePosition,
      PositionApis,
      { },
      NoState
    );
  }
);