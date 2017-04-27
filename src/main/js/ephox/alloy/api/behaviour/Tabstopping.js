define(
  'ephox.alloy.api.behaviour.Tabstopping',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.behaviour.common.NoState',
    'ephox.alloy.behaviour.tabstopping.ActiveTabstopping',
    'ephox.alloy.behaviour.tabstopping.TabstopSchema'
  ],

  function (Behaviour, NoState, ActiveTabstopping, TabstopSchema) {
    return Behaviour.create(
      TabstopSchema,
      'tabstopping',
      ActiveTabstopping,
      Behaviour.noApis(),
      Behaviour.noExtra(),
      NoState
    );
  }
);