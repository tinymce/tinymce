define(
  'ephox.alloy.api.behaviour.Sliding',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.behaviour.sliding.ActiveSliding',
    'ephox.alloy.behaviour.sliding.SlidingApis',
    'ephox.alloy.behaviour.sliding.SlidingSchema'
  ],

  function (Behaviour, ActiveSliding, SlidingApis, SlidingSchema) {
    return Behaviour.create(
      SlidingSchema,
      'sliding',
      ActiveSliding,
      SlidingApis,
      { }
    );
  }
);