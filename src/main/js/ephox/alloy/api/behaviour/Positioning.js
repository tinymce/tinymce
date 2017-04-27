define(
  'ephox.alloy.api.behaviour.Positioning',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.behaviour.positioning.ActivePosition',
    'ephox.alloy.behaviour.positioning.PositionApis',
    'ephox.alloy.behaviour.positioning.PositionSchema'
  ],

  function (Behaviour, ActivePosition, PositionApis, PositionSchema) {
    return Behaviour.create({
      fields: PositionSchema,
      name: 'positioning',
      active: ActivePosition,
      apis: PositionApis
    });
  }
);