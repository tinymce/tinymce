define(
  'ephox.alloy.api.behaviour.Sandboxing',

  [
    'ephox.alloy.api.behaviour.BehaviourExport'
  ],

  function (BehaviourExport) {
    return BehaviourExport.build(
      'sandboxing',
      [
        'openSandbox', // change to open
        'closeSandbox', // change to close
        'isShowing', // change to isOpen
        'isPartOf',
        'showSandbox', // change to preview
        'gotoSandbox', // change to enter
        'getState'
      ],
      { }
    );
  }
);