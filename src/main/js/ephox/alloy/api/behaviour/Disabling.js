define(
  'ephox.alloy.api.behaviour.Disabling',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.behaviour.common.NoState',
    'ephox.alloy.behaviour.disabling.ActiveDisable',
    'ephox.alloy.behaviour.disabling.DisableApis',
    'ephox.alloy.behaviour.disabling.DisableSchema'
  ],

  function (Behaviour, NoState, ActiveDisable, DisableApis, DisableSchema) {
    return Behaviour.create(
      DisableSchema,
      'disabling',
      ActiveDisable,
      DisableApis,
      NoState
    );
  }
);