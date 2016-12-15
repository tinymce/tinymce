asynctest(
  'SplitToolbarTest',
 
  [
    'ephox.agar.api.Keyboard',
    'ephox.agar.api.Keys',
    'ephox.agar.api.Step',
    'ephox.alloy.api.GuiFactory',
    'ephox.alloy.api.ui.SplitToolbar',
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.test.GuiSetup'
  ],
 
  function (Keyboard, Keys, Step, GuiFactory, SplitToolbar, EventHandler, GuiSetup) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    GuiSetup.setup(function (store, doc, body) {
      return GuiFactory.build(
        SplitToolbar.build({
          dom: {
            tag: 'div'
          }
        })
      );

    }, function (doc, body, gui, component, store) {
      return [
        Step.fail('split.toolbar')
      ];
    }, function () { success(); }, failure);

  }
);