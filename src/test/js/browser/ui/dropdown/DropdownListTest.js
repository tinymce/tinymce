asynctest(
  'Dropdown List',
 
  [
    'ephox.agar.api.FocusTools',
    'ephox.agar.api.Mouse',
    'ephox.agar.api.Step',
    'ephox.alloy.api.GuiFactory',
    'ephox.alloy.api.Memento',
    'ephox.alloy.api.ui.Dropdown',
    'ephox.alloy.api.ui.menus.MenuData',
    'ephox.alloy.test.GuiSetup',
    'ephox.knoch.future.Future',
    'ephox.peanut.Fun',
    'ephox.perhaps.Result',
    'ephox.sugar.api.TextContent'
  ],
 
  function (FocusTools, Mouse, Step, GuiFactory, Memento, Dropdown, MenuData, GuiSetup, Future, Fun, Result, TextContent) {
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
        Dropdown.build(function (parts) {
          return {
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
              menu: parts.menu().build({
                members: {
                  menu: {
                    munge: function (menuSpec) {
                      return {
                        dom: {
                          tag: 'container',
                          classes: [ 'menu' ]
                        },
                        components: [
                          { uiType: 'placeholder', name: '<alloy.menu.items>', owner: 'menu' }
                        ]
                      };
                    }
                  },
                  item: {
                    munge: function (itemSpec) {
                      return {
                        dom: {
                          tag: 'li',
                          classes: [ 'item' ],
                          innerHtml: itemSpec.data.text
                        },
                        components: [ ]
                      };
                    }
                  }
                },
                markers: {
                  item: 'item',
                  selectedItem: 'selected-item',
                  menu: 'menu',
                  selectedMenu: 'selected-menu',
                  'backgroundMenu': 'background-menu'
                },
                onExecute: function () { }
              })
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
          };
        })
      );

      return c;

    }, function (doc, body, gui, component, store) {
      gui.add(
        GuiFactory.build(sink.asSpec())
      );

      return [
        Mouse.sClickOn(gui.element(), 'button'),

        FocusTools.sTryOnSelector('Focus should be on alpha', doc, 'li:contains("Alpha")'),
        Step.fail('Abrupt finish')
      ];
    }, function () { success(); }, failure);

  }
);