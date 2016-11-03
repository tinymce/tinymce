define(
  'ephox.alloy.api.behaviour.Coupling',

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