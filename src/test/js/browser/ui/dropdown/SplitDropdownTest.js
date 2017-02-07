asynctest(
  'SplitDropdown List',
 
  [
    'ephox.agar.api.ApproxStructure',
    'ephox.agar.api.Assertions',
    'ephox.agar.api.FocusTools',
    'ephox.agar.api.Mouse',
    'ephox.agar.api.Step',
    'ephox.agar.api.UiFinder',
    'ephox.agar.api.Waiter',
    'ephox.alloy.api.component.GuiFactory',
    'ephox.alloy.api.component.Memento',
    'ephox.alloy.api.ui.Container',
    'ephox.alloy.api.ui.SplitDropdown',
    'ephox.alloy.api.ui.TieredMenu',
    'ephox.alloy.test.GuiSetup',
    'ephox.alloy.test.dropdown.TestDropdownMenu',
    'ephox.knoch.future.Future',
    'ephox.perhaps.Result',
    'ephox.sugar.api.TextContent'
  ],
 
  function (ApproxStructure, Assertions, FocusTools, Mouse, Step, UiFinder, Waiter, GuiFactory, Memento, Container, SplitDropdown, TieredMenu, GuiSetup, TestDropdownMenu, Future, Result, TextContent) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    var sink = Memento.record(
      Container.sketch({
        behaviours: {
          positioning: {
            useFixed: true
          }
        }
      })
    );

    GuiSetup.setup(function (store, doc, body) {


      var displayer = Memento.record(
        Container.sketch({
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
        })
      );

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

          parts: {
            menu: TestDropdownMenu(store),
            arrow: {
              dom: {
                tag: 'button',
                innerHtml: 'v',
                classes: [ 'test-split-button-arrow' ]
              }
            },
            button: {
              dom: {
                tag: 'button',
                classes: [ 'test-split-button-action' ]
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
              return TieredMenu.simpleData('test', 'Test', f);
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
        Assertions.sAssertStructure(
          'Check basic initial structure',
          ApproxStructure.build(function (s, str, arr) {
            return s.element('span', {
              attrs: {
                role: str.is('presentation')
              },

              children: [
                s.element('button', {
                  attrs: {
                    role: str.is('button')
                  }
                }),
                s.element('button', {
                  attrs: {
                    role: str.is('button')
                  }
                })
              ]
            });
          }),
          component.element()
        ),

        store.sClear,
        store.sAssertEq('Should be empty', [ ]),
        Mouse.sClickOn(gui.element(), '.test-split-button-action'),
        store.sAssertEq('After clicking on action', [ 'dropdown.execute' ]),
        UiFinder.sNotExists(gui.element(), '[role="menu"]'),
        store.sClear,

        Mouse.sClickOn(gui.element(), '.test-split-button-arrow'),
        store.sAssertEq('After clicking on action', [ ]),
        Waiter.sTryUntil(
          'Waiting until menu appears',
          UiFinder.sExists(gui.element(), '[role="menu"]'),
          100,
          1000
        ),
        FocusTools.sTryOnSelector('Focus should be on alpha', doc, 'li:contains("Alpha")')

        // TODO: Beef up tests.
      ];
    }, function () { success(); }, failure);

  }
);