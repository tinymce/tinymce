asynctest(
  'TabSection Test',
 
  [
    'ephox.agar.api.Step',
    'ephox.alloy.api.GuiFactory',
    'ephox.alloy.api.ui.TabSection',
    'ephox.alloy.test.GuiSetup'
  ],
 
  function (Step, GuiFactory, TabSection, GuiSetup) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    GuiSetup.setup(function (store, doc, body) {
      return GuiFactory.build(
        TabSection.build(function (parts) {
          return {
            dom: {
              tag: 'div'
            },
            components: [
              parts.tabbar().placeholder(),
              parts.tabview().placeholder()
            ],
            parts: {
              tabbar: parts.tabbar().build({ }),
              tabview: parts.tabview().build({ })
            }
          };
        })
      );

    }, function (doc, body, gui, component, store) {
      return [
        Step.fail('done')
      ];
    }, function () { success(); }, failure);

  }
);