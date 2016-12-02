define(
  'ephox.alloy.api.behaviour.Invalidating',

  [
    'ephox.alloy.api.behaviour.BehaviourExport',
    'ephox.alloy.behaviour.invalidating.ActiveInvalidate',
    'ephox.alloy.behaviour.invalidating.InvalidateApis',
    'ephox.alloy.behaviour.invalidating.InvalidateSchema'
  ],

  function (BehaviourExport, ActiveInvalidate, InvalidateApis, InvalidateSchema) {
    return BehaviourExport.santa(
      InvalidateSchema,
      'invalidating',
      ActiveInvalidate,
      InvalidateApis,
      { }
    );
  }
);