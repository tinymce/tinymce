asynctest(
  'BasicToolbarTest',
 
  [
    'ephox.agar.api.Step',
    'ephox.alloy.api.GuiFactory',
    'ephox.alloy.test.GuiSetup'
  ],
 
  function (Step, GuiFactory, GuiSetup) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    GuiSetup.setup(function (store, doc, body) {
      return GuiFactory.build({
        uiType: 'container'
      });

    }, function (doc, body, gui, component, store) {
      return [
        Step.fail('toolbar.test')
      ];
    }, function () { success(); }, failure);

  }
);