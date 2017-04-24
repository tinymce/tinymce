define(
  'ephox.alloy.api.behaviour.Toggling',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.behaviour.common.NoState',
    'ephox.alloy.behaviour.toggling.ActiveToggle',
    'ephox.alloy.behaviour.toggling.ToggleApis',
    'ephox.alloy.behaviour.toggling.ToggleSchema'
  ],

  function (Behaviour, NoState, ActiveToggle, ToggleApis, ToggleSchema) {
    return Behaviour.create(
      ToggleSchema,
      'toggling',
      ActiveToggle,
      ToggleApis,
      { },
      NoState
    );
  }
);