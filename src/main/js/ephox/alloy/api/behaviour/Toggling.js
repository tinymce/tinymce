define(
  'ephox.alloy.api.behaviour.Toggling',

  [
    'ephox.alloy.aad.ActiveToggle',
    'ephox.alloy.aad.ToggleApis',
    'ephox.alloy.aad.ToggleSchema',
    'ephox.alloy.api.behaviour.BehaviourExport'
  ],

  function (ActiveToggle, ToggleApis, ToggleSchema, BehaviourExport) {
    return BehaviourExport.santa(
      ToggleSchema,
      'toggling',
      ActiveToggle,
      ToggleApis
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