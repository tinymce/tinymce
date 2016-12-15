asynctest(
  'SplitToolbarTest',
 
  [
    'ephox.agar.api.Keyboard',
    'ephox.agar.api.Keys',
    'ephox.agar.api.Step',
    'ephox.alloy.api.GuiFactory',
    'ephox.alloy.api.ui.Button',
    'ephox.alloy.api.ui.SplitToolbar',
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.test.GuiSetup',
    'ephox.alloy.test.toolbar.TestPartialToolbarGroup',
    'ephox.compass.Arr',
    'ephox.sugar.api.Css'
  ],
 
  function (Keyboard, Keys, Step, GuiFactory, Button, SplitToolbar, EventHandler, GuiSetup, TestPartialToolbarGroup, Arr, Css) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    GuiSetup.setup(function (store, doc, body) {
      return GuiFactory.build(
        SplitToolbar.build({
          dom: {
            tag: 'div',
            styles: {
              width: '400px',
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
            },

            'overflow-button': {
              dom: {
                tag: 'button',
                innerHtml: '+More+'
              }
            }
          }
        })
      );

    }, function (doc, body, gui, component, store) {

      var makeButton = function (itemSpec) {
        return Button.build({
          dom: {
            tag: 'button',
            innerHtml: itemSpec.text
          }
        });
      };

      var sResetWidth = function (px) {
        return Step.sync(function () {
          Css.set(component.element(), 'width', px);
          SplitToolbar.refresh(component);
        });
      };

      return [
        GuiSetup.mAddStyles(doc, [
          '.test-sliding-closed { visibility: hidden; opacity: 0; }',
          '.test-sliding-open { visibility: visible; opacity: 1 }',
          '.test-sliding-height-growing { transition: height 0.3s ease, opacity 0.2s linear 0.1s; }',
          '.test-sliding-height-shrinking { transition: opacity 0.3s ease, height 0.2s, linear 0.1s, visibility 0s linear 0.3s }',

          '.test-toolbar-group { display: flex; }',
          '.test-toolbar-primary { display: flex; }',

          '.test-toolbar-primary button { width: 100px; }'
        ]),

        Step.sync(function () {
          var groups = SplitToolbar.createGroups(component, [
            { items: Arr.map([ { text: 'alpha' }, { text: 'beta' } ], makeButton) },
            { items: Arr.map([ { text: 'gamma' }, { text: 'delta' } ], makeButton) },
            { items: Arr.map([ { text: 'epsilon' }, { text: 'rho' }, { text: 'theta' } ], makeButton) }
          ]);
          SplitToolbar.setGroups(component, groups);
        }),

        Step.wait(1000),

        sResetWidth('300px'),

        Step.wait(1000),

        sResetWidth('400px'),
        Step.wait(1000),
        sResetWidth('550px'),
        Step.wait(1000),

        sResetWidth('1000px'),
        Step.wait(1000),

        Step.fail('split.toolbar')
      ];
    }, function () { success(); }, failure);

  }
);