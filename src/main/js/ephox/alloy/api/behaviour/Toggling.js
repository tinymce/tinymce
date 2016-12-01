define(
  'ephox.alloy.api.behaviour.Toggling',

  [
    'ephox.alloy.behaviour.toggling.ActiveToggle',
    'ephox.alloy.behaviour.toggling.ToggleApis',
    'ephox.alloy.behaviour.toggling.ToggleSchema',
    'ephox.alloy.api.behaviour.BehaviourExport'
  ],

  function (ActiveToggle, ToggleApis, ToggleSchema, BehaviourExport) {
    return BehaviourExport.santa(
      ToggleSchema,
      'toggling',
      ActiveToggle,
      ToggleApis
    );
  }
);