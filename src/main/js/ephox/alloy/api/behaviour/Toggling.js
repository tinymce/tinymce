define(
  'ephox.alloy.api.behaviour.Toggling',

  [
    'ephox.alloy.api.behaviour.BehaviourExport',
    'ephox.alloy.behaviour.Toggling'
  ],

  function (BehaviourExport, Toggling) {
    return BehaviourExport.santa(
      Toggling,
      {

      }
    );
    return BehaviourExport.build(
      'toggling',
      [
        // Make a branching behaviour, because selecting only makes sense for buttons. (and aria stuff)
        'toggle',
        'select',
        'deselect',
        'isSelected'
      ]
    );
  }
);