define(
  'ephox.alloy.api.behaviour.Invalidating',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.behaviour.invalidating.ActiveInvalidate',
    'ephox.alloy.behaviour.invalidating.InvalidateApis',
    'ephox.alloy.behaviour.invalidating.InvalidateSchema'
  ],

  function (Behaviour, ActiveInvalidate, InvalidateApis, InvalidateSchema) {
    return Behaviour.create({
      fields: InvalidateSchema,
      name: 'invalidating',
      active: ActiveInvalidate,
      apis: InvalidateApis
    });
  }
);