define(
  'ephox.alloy.api.behaviour.Invalidating',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.behaviour.common.NoState',
    'ephox.alloy.behaviour.invalidating.ActiveInvalidate',
    'ephox.alloy.behaviour.invalidating.InvalidateApis',
    'ephox.alloy.behaviour.invalidating.InvalidateSchema'
  ],

  function (Behaviour, NoState, ActiveInvalidate, InvalidateApis, InvalidateSchema) {
    return Behaviour.create(
      InvalidateSchema,
      'invalidating',
      ActiveInvalidate,
      InvalidateApis,
      { },
      NoState
    );
  }
);