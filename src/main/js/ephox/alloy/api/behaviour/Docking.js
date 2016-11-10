define(
  'ephox.alloy.api.behaviour.Docking',

  [
    'ephox.alloy.api.behaviour.BehaviourExport'
  ],

  function (BehaviourExport) {
    return BehaviourExport.build(
      'coupling',
      [
        'getCoupled'
      ],
      { }
    );
  }
);