define(
  'ephox.alloy.demo.DropdownsDemo',

  [
    'ephox.alloy.api.Gui',
    'ephox.alloy.api.GuiFactory',
    'ephox.alloy.demo.HtmlDisplay',
    'ephox.knoch.future.Future',
    'ephox.sugar.api.Class',
    'ephox.sugar.api.DomEvent',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Insert',
    'global!document'
  ],

  function (Gui, GuiFactory, HtmlDisplay, Future, Class, DomEvent, Element, Insert, document) {
    return function () {
      var gui = Gui.create();
      var body = Element.fromDom(document.body);
      Class.add(gui.element(), 'gui-root-demo-container');
      // Css.set(gui.element(), 'direction', 'rtl');

      Insert.append(body, gui.element());

      var sink = GuiFactory.build({
        uiType: 'custom',
        dom: {
          tag: 'div'
        },
        positioning: {
          useFixed: true
        }
      });

      gui.add(sink);      

      console.log('sink', sink.element());

      var onMousedown = DomEvent.bind(Element.fromDom(document), 'mousedown', function (evt) {
        gui.broadcastOn([ 'dismiss.popups' ], {
          target: evt.target()
        });
      });

      HtmlDisplay.section(
        gui,
        'This dropdown button has four possible values: alpha, beta, gamma, and delta',
        {
          uiType: 'dropdown',
          text: 'Dropdown',
          dom: {
            tag: 'button',
            innerHtml: 'Click me'
          },
          members: {
            menu: {
              dom: {
                tag: 'ul',
                styles: {
                  background: 'blue'
                }
              }

            },
            item: {
              dom: {
                tag: 'li',
                styles: {
                  background: 'green'
                }
              }
            }
            // menu: GuiTempalte.use(TemplateMenu)
            // dom: {
            //   tag: 'div'  
            // },
            // itemDefn: { }            
          },
          fetchItems: function () {
            return Future.pure([
              { value: 'alpha', text: 'Alpha' },
              { value: 'beta', text: 'Beta' },
              { value: 'gamma', text: 'Gamma' },
              { value: 'delta', text: 'Delta' }
            ]);
          },
          // sink: sink,
          desc: 'demo-dropdown',
          onExecute: function (sandbox, item, itemValue) {
            console.log('*** dropdown demo execute on: ' + itemValue + ' ***');
          }
        }
      );

      HtmlDisplay.section(
        gui,
        'This dropdown menu has an intricate menu system derived from Sublime sorting',
        {
          uiType: 'dropdownmenu',
          dom: {
            tag: 'button',
            innerHtml: '+'
          },
          sink: sink,
          members: {
            menu: {
              dom: {
                tag: 'ul',
                styles: {
                  background: 'blue'
                }
              }

            },
            item: {
              dom: {
                tag: 'li',
                styles: {
                  background: 'green'
                }
              }
            }
            // menu: GuiTempalte.use(TemplateMenu)
            // dom: {
            //   tag: 'div'  
            // },
            // itemDefn: { }            
          },
          onExecute: function (sandbox, item, itemValue) {
            console.log('*** dropdown menu demo execute on: ' + itemValue + ' ***');
          },
          fetch: function () {
            return Future.pure({
              primary: 'tools-menu',
              menus: {
                'tools-menu': [
                  { type: 'item', value: 'packages', text: 'Packages' },
                  { type: 'item', value: 'about', text: 'About' },
                  { 
                    type: 'widget',
                    value: 'widget',
                    spec: {
                      uiType: 'custom',
                      dom: {
                        tag: 'div'
                      },
                      components: [
                        {
                          uiType: 'input',
                          dom: {
                            styles: {
                              display: 'inline-block',
                              width: '50px'
                            }
                          }
                        },
                        {
                          uiType: 'custom',
                          dom: {
                            tag: 'div'
                          },
                          components: [
                            {
                              uiType: 'button',
                              action: function () { console.log('clicked on a button', arguments); },
                              dom: {
                                tag: 'button',
                                innerHtml: '-'
                              },
                              // FIX: This is required to override a previous tabstopping.
                              tabstopping: undefined
                            },
                            {
                              uiType: 'button',
                              action: function () { console.log('clicked on a button', arguments); },
                              dom: {
                                tag: 'button',
                                innerHtml: '+'
                              },
                              tabstopping: undefined
                            }
                          ],
                          keying: {
                            mode: 'flow',
                            selector: 'button'
                          },
                          tabstopping: true
                        }
                      ],
                      keying: {
                        mode: 'cyclic'
                      }
                    }
                  }
                ],
                'packages-menu': [
                  { type: 'item', value: 'sortby', text: 'SortBy' }
                ],
                'sortby-menu': [
                  { type: 'item', value: 'strings', text: 'Strings' },
                  { type: 'item', value: 'numbers', text: 'Numbers' }
                ],
                'strings-menu': [
                  { type: 'item', value: 'version', text: 'Versions', html: '<b>V</b>ersions' },
                  { type: 'item', value: 'alphabetic', text: 'Alphabetic' }
                ],
                'numbers-menu': [
                  { type: 'item', value: 'doubled', text: 'Double digits' }
                ]
              }, 
              expansions: {
                'packages': 'packages-menu',
                'sortby': 'sortby-menu',
                'strings': 'strings-menu',
                'numbers': 'numbers-menu' 
              }
            });
          }
        }
      );
    };
  }
);