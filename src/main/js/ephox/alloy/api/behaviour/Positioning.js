define(
  'ephox.alloy.api.behaviour.Positioning',

  [
    'ephox.alloy.api.behaviour.BehaviourExport'
  ],

  function (BehaviourExport) {
    return BehaviourExport.build(
      'positioning',
      [
        'position',
        'addContainer',
        'removeContainer'
      ]
    );
  }
);