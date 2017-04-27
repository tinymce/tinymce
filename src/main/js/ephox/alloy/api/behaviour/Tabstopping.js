define(
  'ephox.alloy.api.behaviour.Tabstopping',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.behaviour.tabstopping.ActiveTabstopping',
    'ephox.alloy.behaviour.tabstopping.TabstopSchema'
  ],

  function (Behaviour, ActiveTabstopping, TabstopSchema) {
    return Behaviour.create({
      fields: TabstopSchema,
      name: 'tabstopping',
      active: ActiveTabstopping
    });
  }
);