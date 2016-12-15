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

          markers: {
            closedStyle: 'test-sliding-closed',
            openStyle: 'test-sliding-open',
            shrinkingStyle: 'test-sliding-height-shrinking',
            growingStyle: 'test-sliding-height-growing'
          },

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
        GuiSetup.mAddStyles(doc, [
          '.test-sliding-closed { visibility: hidden; opacity: 0; }',
          '.test-sliding-open { visibility: visible; opacity: 1 }',
          '.test-sliding-height-growing { transition: height 0.3s ease, opacity: 0.2s linear 0.1s; }',
          '.test-sliding-height-shrinking { transition: opacity 0.3s ease, height 0.2s, linear 0.1s, visibility 0s linear 0.3s }'
        ]),
        Step.fail('split.toolbar')
      ];
    }, function () { success(); }, failure);

  }
);