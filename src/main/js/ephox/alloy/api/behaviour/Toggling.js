define(
  'ephox.alloy.api.behaviour.Toggling',

  [
    'ephox.alloy.api.behaviour.BehaviourExport'
  ],

  function (BehaviourExport) {
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