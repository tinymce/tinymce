asynctest(
  'SplitToolbarTest',
 
  [
    'ephox.agar.api.Keyboard',
    'ephox.agar.api.Keys',
    'ephox.agar.api.Step',
    'ephox.alloy.api.GuiFactory',
    'ephox.alloy.api.ui.SplitToolbar',
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.test.GuiSetup',
    'ephox.alloy.test.toolbar.TestPartialToolbarGroup'
  ],
 
  function (Keyboard, Keys, Step, GuiFactory, SplitToolbar, EventHandler, GuiSetup, TestPartialToolbarGroup) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    GuiSetup.setup(function (store, doc, body) {
      return GuiFactory.build(
        SplitToolbar.build({
          dom: {
            tag: 'div'
          },
          components: [
            SplitToolbar.parts().primary(),
            SplitToolbar.parts().overflow()
          ],

          parts: {
            primary: {
              dom: {
                tag: 'div'
              },
              shell: true,
              parts: {
                groups: { }
              },
              members: {
                group: {
                  munge: TestPartialToolbarGroup.munge
                }
              }
            },
            overflow: {
              dom: {
                tag: 'div'
              },
              shell: true,
              parts: {
                groups: { }
              },
              members: {
                group: {
                  munge: TestPartialToolbarGroup.munge
                }
              }
            }
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