define(
  'ephox.alloy.api.behaviour.Positioning',

  [
    'ephox.alloy.api.behaviour.BehaviourExport',
    'ephox.alloy.behaviour.positioning.ActivePosition',
    'ephox.alloy.behaviour.positioning.PositionApis',
    'ephox.alloy.behaviour.positioning.PositionSchema'
  ],

  function (BehaviourExport, ActivePosition, PositionApis, PositionSchema) {
    return BehaviourExport.santa(
      PositionSchema,
      'positioning',
      ActivePosition,
      PositionApis,
      { }
    );
  }
);