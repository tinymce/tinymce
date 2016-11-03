define(
  'ephox.alloy.api.behaviour.Invalidating',

  [
    'ephox.alloy.api.behaviour.BehaviourExport'
  ],

  function (BehaviourExport) {
    return BehaviourExport.build(
      'invalidating',
      [
        'markValid',
        'markInvalid'
      ],
      { }
    );
  }
);