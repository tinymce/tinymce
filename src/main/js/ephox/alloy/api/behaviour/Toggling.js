define(
  'ephox.alloy.api.behaviour.Toggling',

  [
    'ephox.alloy.behaviour.toggling.ActiveToggle',
    'ephox.alloy.behaviour.toggling.ToggleApis',
    'ephox.alloy.behaviour.toggling.ToggleSchema',
    'ephox.alloy.api.behaviour.Behaviour'
  ],

  function (ActiveToggle, ToggleApis, ToggleSchema, Behaviour) {
    return Behaviour.create(
      ToggleSchema,
      'toggling',
      ActiveToggle,
      ToggleApis
    );
  }
);