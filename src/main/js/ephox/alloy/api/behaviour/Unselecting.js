define(
  'ephox.alloy.api.behaviour.Unselecting',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.behaviour.unselecting.ActiveUnselecting'
  ],

  function (Behaviour, ActiveUnselecting) {
    return Behaviour.create(
      // No schema for unselecting
      [ ],
      'unselecting',
      ActiveUnselecting,
      { },
      { }
    );
  }
);