define(
  'ephox.alloy.behaviour.common.BehaviourState',

  [
    'ephox.katamari.api.Contracts'
  ],

  function (Contracts) {
    return Contracts.ensure([
      'readState'
    ]);
  }
);
