define(
  'ephox.alloy.api.behaviour.Sliding',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.behaviour.sliding.ActiveSliding',
    'ephox.alloy.behaviour.sliding.SlidingApis',
    'ephox.alloy.behaviour.sliding.SlidingSchema',
    'ephox.alloy.behaviour.sliding.SlidingState'
  ],

  function (Behaviour, ActiveSliding, SlidingApis, SlidingSchema, SlidingState) {
    return Behaviour.create({
      fields: SlidingSchema,
      name: 'sliding',
      active: ActiveSliding,
      apis: SlidingApis,
      state: SlidingState
    });
  }
);