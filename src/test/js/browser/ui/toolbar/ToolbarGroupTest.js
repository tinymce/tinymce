asynctest(
  'ToolbarGroupTest',
 
  [
    'ephox.agar.api.Step',
    'ephox.alloy.api.GuiFactory',
    'ephox.alloy.api.ui.ToolbarGroup',
    'ephox.alloy.test.GuiSetup'
  ],
 
  function (Step, GuiFactory, ToolbarGroup, GuiSetup) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    GuiSetup.setup(function (store, doc, body) {
      return GuiFactory.build(
        ToolbarGroup.build({
          dom: {
            tag: 'div'
          },
          components: [
            ToolbarGroup.parts().items()
          ],

          items: [ ],

          parts: {
            items: {

            }
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