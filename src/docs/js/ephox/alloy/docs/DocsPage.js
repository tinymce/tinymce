define(
  'ephox.alloy.docs.DocsPage',

  [
    'ephox.alloy.api.system.Gui',
    'ephox.sugar.api.Insert',
    'ephox.sugar.api.SelectorFind'
  ],

  function (Gui, Insert, SelectorFind) {
    var root = Gui.create();

    var ephoxUi = SelectorFind.first('#ephox-ui').getOrDie();

    Insert.append(ephoxUi, root);
  }
);