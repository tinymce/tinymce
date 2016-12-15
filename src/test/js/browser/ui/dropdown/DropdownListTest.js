asynctest(
  'Dropdown List',
 
  [
    'ephox.agar.api.FocusTools',
    'ephox.agar.api.Mouse',
    'ephox.alloy.api.GuiFactory',
    'ephox.alloy.api.Memento',
    'ephox.alloy.api.ui.Dropdown',
    'ephox.alloy.api.ui.menus.MenuData',
    'ephox.alloy.test.GuiSetup',
    'ephox.alloy.test.dropdown.TestDropdownMenu',
    'ephox.knoch.future.Future',
    'ephox.perhaps.Result',
    'ephox.sugar.api.TextContent'
  ],
 
  function (FocusTools, Mouse, GuiFactory, Memento, Dropdown, MenuData, GuiSetup, TestDropdownMenu, Future, Result, TextContent) {
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
            initialValue: 'hi',
            onSet: function (button, val) {
              TextContent.set(button.element(), val);
            }
          }
        }
      });

      var c = GuiFactory.build(
        Dropdown.build({
          dom: {
            tag: 'button'
          },

          components: [
            displayer.asSpec()
          ],

          lazySink: function () {
            return Result.value(sink.get(c));
          },

          uiType: 'dropdown-list',

          parts: {
            menu: TestDropdownMenu(store)
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
      gui.add(
        GuiFactory.build(sink.asSpec())
      );

      return [
        Mouse.sClickOn(gui.element(), 'button'),

        FocusTools.sTryOnSelector('Focus should be on alpha', doc, 'li:contains("Alpha")')

        // TODO: Beef up tests.
      ];
    }, function () { success(); }, failure);

  }
);