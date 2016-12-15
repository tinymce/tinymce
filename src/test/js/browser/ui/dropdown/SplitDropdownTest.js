asynctest(
  'SplitDropdown List',
 
  [
    'ephox.agar.api.FocusTools',
    'ephox.agar.api.Mouse',
    'ephox.agar.api.Step',
    'ephox.alloy.api.GuiFactory',
    'ephox.alloy.api.Memento',
    'ephox.alloy.api.ui.SplitDropdown',
    'ephox.alloy.api.ui.menus.MenuData',
    'ephox.alloy.test.GuiSetup',
    'ephox.alloy.test.dropdown.TestDropdownMenu',
    'ephox.knoch.future.Future',
    'ephox.perhaps.Result',
    'ephox.sugar.api.TextContent'
  ],
 
  function (FocusTools, Mouse, Step, GuiFactory, Memento, SplitDropdown, MenuData, GuiSetup, TestDropdownMenu, Future, Result, TextContent) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    var sink = Memento.record({
      uiType: 'container',
      behaviours: {
        positioning: {
          useFixed: true
        }
      }
    });

    GuiSetup.setup(function (store, doc, body) {


      var displayer = Memento.record({
        uiType: 'custom',
        dom: {
          tag: 'span'
        },
        behaviours: {
          representing: {
            store: {
              mode: 'memory',
              initialValue: 'hi'
            },            
            onSet: function (button, val) {
              TextContent.set(button.element(), val);
            }
          }
        }
      });

      console.log('displayer', displayer.asSpec());

      var c = GuiFactory.build(
        SplitDropdown.build({
          dom: {
            tag: 'span'
          },

          toggleClass: '.test-selected-dropdown',
          onExecute: store.adderH('dropdown.execute'),

          components: [
            SplitDropdown.parts().button(),
            SplitDropdown.parts().arrow()
          ],

          lazySink: function () {
            return Result.value(sink.get(c));
          },

          uiType: 'dropdown-list',

          parts: {
            menu: TestDropdownMenu(store),
            arrow: {
              dom: {
                tag: 'button',
                innerHtml: 'v',
                classes: [ 'test-split-button-action' ]
              }
            },
            button: {
              dom: {
                tag: 'button',
                classes: [ 'test-split-button-arrow' ]
              },
              components: [
                displayer.asSpec()
              ]
            }
          },
      
          fetch: function () { 
            var future = Future.pure([
              { type: 'item', data: { value: 'alpha', text: 'Alpha' } },
              { type: 'item', data: { value: 'beta', text: 'Beta' } }
            ]);

            return future.map(function (f) {
              return MenuData.simple('test', 'Test', f);
            });
          }
        })
      );

      return c;

    }, function (doc, body, gui, component, store) {
      component.logSpec();

      gui.add(
        GuiFactory.build(sink.asSpec())
      );

      return [
        Mouse.sClickOn(gui.element(), 'button'),
        Step.wait(100000),

        FocusTools.sTryOnSelector('Focus should be on alpha', doc, 'li:contains("Alpha")')

        // TODO: Beef up tests.
      ];
    }, function () { success(); }, failure);

  }
);