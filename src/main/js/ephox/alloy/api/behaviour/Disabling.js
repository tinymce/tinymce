define(
  'ephox.alloy.api.behaviour.Disabling',

  [
    'ephox.alloy.api.behaviour.BehaviourExport'
  ],

  function (BehaviourExport) {
    return BehaviourExport.build(
      'disabling',
      [
        'enable',
        'disable',
        'isDisabled'
      ],
      { }
    );
  }
);