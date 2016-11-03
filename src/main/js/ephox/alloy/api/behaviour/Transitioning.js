define(
  'ephox.alloy.api.behaviour.Transitioning',

  [
    'ephox.alloy.api.behaviour.BehaviourExport'
  ],

  function (BehaviourExport) {
    return BehaviourExport.bulid(
      'transitioning',
      [
        'transition',
        'revertToBase'
      ],
      { }
    );
  }
);