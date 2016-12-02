define(
  'ephox.alloy.api.behaviour.Tabstopping',

  [
    'ephox.alloy.api.behaviour.BehaviourExport',
    'ephox.alloy.behaviour.tabstopping.ActiveTabstopping',
    'ephox.alloy.behaviour.tabstopping.TabstopSchema'
  ],

  function (BehaviourExport, ActiveTabstopping, TabstopSchema) {
    return BehaviourExport.santa(
      TabstopSchema,
      'tabstopping',
      ActiveTabstopping,
      { },
      { }
    );
  }
);