define(
  'ephox.alloy.api.behaviour.Sliding',

  [
    'ephox.alloy.api.behaviour.BehaviourExport'
  ],

  function (BehaviourExport) {
    return BehaviourExport.build(
      'sliding',
      [
        'grow',
        'shrink',
        'hasGrown',
        'toggleGrow',
        'immediateShrink'
      ],
      { 

      }
    );
  }
);