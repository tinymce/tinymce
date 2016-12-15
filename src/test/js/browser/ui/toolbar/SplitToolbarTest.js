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
            tag: 'div',
            styles: {
              width: '200px',
              outline: '2px solid blue'
            }
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
                tag: 'div',
                classes: [ 'test-toolbar-primary' ]
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
                tag: 'div',
                classes: [ 'test-toolbar-overflow' ]
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
          '.test-sliding-height-shrinking { transition: opacity 0.3s ease, height 0.2s, linear 0.1s, visibility 0s linear 0.3s }',

          '.test-toolbar-group { display: flex; }',
          '.test-toolbar-primary { display: flex; }'
        ]),

        Step.sync(function () {
          var groups = SplitToolbar.createGroups(component, [
            { items: [ { text: 'alpha' }, { text: 'beta' } ] },
            { items: [ { text: 'gamma' }, { text: 'delta' } ] },
            { items: [ { text: 'epsilon' }, { text: 'rho' }, { text: 'theta' } ] }
          ]);
          SplitToolbar.setGroups(component, groups);
        }),
        Step.fail('split.toolbar')
      ];
    }, function () { success(); }, failure);

  }
);