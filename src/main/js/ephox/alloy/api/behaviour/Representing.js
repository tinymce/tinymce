define(
  'ephox.alloy.api.behaviour.Representing',

  [
    'ephox.alloy.api.behaviour.BehaviourExport'
  ],

  function (BehaviourExport) {
    return BehaviourExport.build(
      'representing',
      [
        'getValue',
        'setValue'
      ],
      { }
    );
  }
);