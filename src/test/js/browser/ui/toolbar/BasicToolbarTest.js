asynctest(
  'BasicToolbarTest',
 
  [
    'ephox.agar.api.Step',
    'ephox.alloy.api.GuiFactory',
    'ephox.alloy.api.ui.Toolbar',
    'ephox.alloy.test.GuiSetup'
  ],
 
  function (Step, GuiFactory, Toolbar, GuiSetup) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    GuiSetup.setup(function (store, doc, body) {
      return GuiFactory.build(
        Toolbar.build({
          dom: {
            tag: 'div'
          }
        })
      );

    }, function (doc, body, gui, component, store) {
      return [
        Step.fail('toolbar.test')
      ];
    }, function () { success(); }, failure);

  }
);