define(
  'ephox.alloy.api.behaviour.Remembering',

  [
    'ephox.alloy.api.behaviour.BehaviourExport'
  ],

  function (BehaviourExport) {
    return BehaviourExport.build(
      'remembering',
      [
        'getData'
      ],
      { }
    );
  }
);