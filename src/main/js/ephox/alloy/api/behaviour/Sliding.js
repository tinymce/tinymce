define(
  'ephox.alloy.api.behaviour.Sliding',

  [
    'ephox.alloy.api.behaviour.BehaviourExport',
    'ephox.alloy.behaviour.sliding.ActiveSliding',
    'ephox.alloy.behaviour.sliding.SlidingApis',
    'ephox.alloy.behaviour.sliding.SlidingSchema'
  ],

  function (BehaviourExport, ActiveSliding, SlidingApis, SlidingSchema) {
    return BehaviourExport.santa(
      SlidingSchema,
      'mode',
      ActiveSliding,
      SlidingApis,
      { }
    );
  }
);