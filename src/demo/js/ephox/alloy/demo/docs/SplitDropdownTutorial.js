define(
  'ephox.alloy.demo.docs.SplitDropdownTutorial',

  [
    'ephox.alloy.api.component.GuiFactory',
    'ephox.alloy.api.system.Gui',
    'ephox.alloy.api.ui.Button',
    'ephox.alloy.api.ui.Dropdown',
    'ephox.alloy.api.ui.Menu',
    'ephox.alloy.api.ui.SplitDropdown',
    'ephox.alloy.api.ui.TieredMenu',
    'ephox.alloy.demo.DemoSink',
    'ephox.alloy.demo.HtmlDisplay',
    'ephox.knoch.future.Future',
    'ephox.peanut.Fun',
    'ephox.perhaps.Result',
    'ephox.sugar.api.Class',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Insert',
    'global!document'
  ],

  function (GuiFactory, Gui, Button, Dropdown, Menu, SplitDropdown, TieredMenu, DemoSink, HtmlDisplay, Future, Fun, Result, Class, Element, Insert, document) {
    return function () {
      var gui = Gui.create();
      var body = Element.fromDom(document.body);
      Class.add(gui.element(), 'gui-root-demo-container');
      Insert.append(body, gui.element());

      var sink = DemoSink.make();

      gui.add(sink);

      var sketchSplitDropdown = function () {
        return SplitDropdown.sketch({
          dom: {
            tag: 'div',
            classes: 'tutorial-split-dropdown'
          },
          components: [
            SplitDropdown.parts().arrow(),
            SplitDropdown.parts().button()
          ],
          toggleClass: 'tutorial-split-dropdown-open',
          fetch: function () {
            return Future.pure(
              TieredMenu.simpleData('tutorial1', 'tutorial1', [
                {
                  data: {
                    value: 'dog',
                    text: 'dog'
                  }
                }
              ])
            );
          },

          
          onExecute: function () {
            console.log('Split dropdown fired');
          },

          lazySink: function () { 
            return Result.value(sink);
          },

          parts: {
            arrow: {
              dom: {
                tag: 'button',
                innerHtml: 'v'
              }
            },
            button: {
              dom: {
                tag: 'button',
                innerHtml: 'Click me'
              }
            },
            menu: {
              markers: {
                backgroundMenu: 'tutorial-background-menu',
                menu: 'tutorial-menu',
                selectedMenu: 'tutorial-selected-menu',
                item: 'tutorial-item',
                selectedItem: 'tutorial-selected-item'
              },

              members: {
                menu: {
                  munge: function (m) {
                    return {
                      dom: {
                        tag: 'div'
                      },
                      components: [
                        Menu.parts().items()
                      ]
                    }
                  }
                },
                item: {
                  munge: function (i) {
                    return {
                      type: 'item',
                      data: i.data,
                      dom: {
                        tag: 'li'
                      },
                      components: [
                        GuiFactory.text(i.data.text)
                      ]
                    };
                  }
                }
              }
            }
          }
        });
      };
      
      var sketchButton = function () {
        return Button.sketch({
          dom: {
            tag: 'button',
            innerHtml: 'Click me'
          }
        });
      };

      var sketchDropdown = function () {
        return Dropdown.sketch({
          fetch: function () {
            return Future.pure(
              TieredMenu.simpleData('a', 'a', [
                { data: { value: 'A', text: 'A' } }
              ])
            );
          },
          toggleClass: 'toggle',
          dom: {
            tag: 'button',
            innerHtml: 'Dropdown'
          },

          lazySink: function () {
            return Result.value(sink);
          },

          parts: {
            menu: {
              markers: {
                backgroundMenu: 'tutorial-background-menu',
                menu: 'tutorial-menu',
                selectedMenu: 'tutorial-selected-menu',
                item: 'tutorial-item',
                selectedItem: 'tutorial-selected-item'
              },

              members: {
                menu: {
                  munge: function (m) {
                    return {
                      dom: {
                        tag: 'div'
                      },
                      components: [
                        Menu.parts().items()
                      ]
                    }
                  }
                },
                item: {
                  munge: function (i) {
                    return {
                      type: 'item',
                      data: i.data,
                      dom: {
                        tag: 'li'
                      },
                      components: [
                        GuiFactory.text(i.data.text)
                      ]
                    };
                  }
                }
              }
            }
          }
        });
      };

      HtmlDisplay.section(
        gui,
        'Testing out the self-documentation',
        sketchDropdown()
      );
    };
  }
);
