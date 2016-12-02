define(
  'ephox.alloy.api.behaviour.Unselecting',

  [
    'ephox.alloy.api.behaviour.BehaviourExport',
    'ephox.alloy.behaviour.unselecting.ActiveUnselecting'
  ],

  function (BehaviourExport, ActiveUnselecting) {
    return BehaviourExport.santa(
      // No schema for unselecting
      [ ],
      'unselecting',
      ActiveUnselecting,
      { },
      { }
    );
  }
);