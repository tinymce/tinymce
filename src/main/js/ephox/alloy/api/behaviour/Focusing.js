define(
  'ephox.alloy.api.behaviour.Focusing',

  [
    'ephox.alloy.api.behaviour.BehaviourExport'
  ],

  function (BehaviourExport) {
    return BehaviourExport.build(
      'focusing',
      [
        'focus',
        'blur',
        'isFocused'
      ],
      { }
    );
  }
);