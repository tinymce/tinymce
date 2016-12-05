define(
  'ephox.alloy.api.behaviour.Sliding',

  [
    'ephox.alloy.api.behaviour.BehaviourExport',
    'ephox.alloy.behaviour.sliding.SlidingBranches'
  ],

  function (BehaviourExport, SlidingBranches) {
    return BehaviourExport.modeSanta(
      'mode',
      SlidingBranches,
      'sliding',
      {
        events: function (slideInfo) {
          var handler = slideInfo.handler();
          return handler.toEvents(slideInfo);
        }
      },
      { },
      { }
    );

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