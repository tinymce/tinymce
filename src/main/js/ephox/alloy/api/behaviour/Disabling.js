define(
  'ephox.alloy.api.behaviour.Disabling',

  [
    'ephox.alloy.api.behaviour.BehaviourExport',
    'ephox.alloy.behaviour.disabling.ActiveDisable',
    'ephox.alloy.behaviour.disabling.DisableApis',
    'ephox.alloy.behaviour.disabling.DisableSchema'
  ],

  function (BehaviourExport, ActiveDisable, DisableApis, DisableSchema) {
    return BehaviourExport.santa(
      DisableSchema,
      'disabling',
      ActiveDisable,
      DisableApis
    );
  }
);