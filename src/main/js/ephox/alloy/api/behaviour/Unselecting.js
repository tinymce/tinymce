define(
  'ephox.alloy.api.behaviour.Unselecting',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.behaviour.common.NoState',
    'ephox.alloy.behaviour.unselecting.ActiveUnselecting'
  ],

  function (Behaviour, NoState, ActiveUnselecting) {
    return Behaviour.create(
      // No schema for unselecting
      [ ],
      'unselecting',
      ActiveUnselecting,
      Behaviour.noApis(),
      Behaviour.noExtra(),
      NoState
    );
  }
);