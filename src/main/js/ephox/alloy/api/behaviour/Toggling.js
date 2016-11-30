define(
  'ephox.alloy.api.behaviour.Toggling',

  [
    'ephox.alloy.aad.ActiveToggle',
    'ephox.alloy.aad.ToggleApis',
    'ephox.alloy.aad.ToggleSchema',
    'ephox.alloy.api.behaviour.BehaviourExport',
    'ephox.alloy.behaviour.Toggling'
  ],

  function (ActiveToggle, ToggleApis, ToggleSchema, BehaviourExport, Toggling) {
    return BehaviourExport.santa(
      ToggleSchema,
      ToggleApis,
      ActiveToggle
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