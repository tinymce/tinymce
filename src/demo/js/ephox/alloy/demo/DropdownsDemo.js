define(
  'ephox.alloy.demo.DropdownsDemo',

  [
    'ephox.alloy.api.Gui',
    'ephox.alloy.api.GuiFactory',
    'ephox.alloy.api.GuiTemplate',
    'ephox.alloy.demo.HtmlDisplay',
    'ephox.compass.Arr',
    'ephox.knoch.future.Future',
    'ephox.sugar.api.Class',
    'ephox.sugar.api.DomEvent',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Insert',
    'global!document',
    'text!dom-templates/demo.menu.item.html'
  ],

  function (Gui, GuiFactory, GuiTemplate, HtmlDisplay, Arr, Future, Class, DomEvent, Element, Insert, document, TemplateMenuItem) {
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
                tag: 'div',
                styles: {
                  background: 'blue'
                }
              }

            },
            item: {
              munge: function (spec) {
                return GuiTemplate.use(
                  TemplateMenuItem,
                  {
                    value: 'bird'
                  }, {
                    fields: spec
                  }
                );
              }
            }
            // menu: GuiTempalte.use(TemplateMenu)
            // dom: {
            //   tag: 'div'  
            // },
            // itemDefn: { }            
          },
          fetchItems: function () {

            var data = [
              { value: 'alpha', text: 'Alpha', 'item-class': 'class-alpha' },
              { value: 'beta', text: 'Beta', 'item-class': 'class-beta' },
              { value: 'gamma', text: 'Gamma', 'item-class': 'class-gamma' },
              { value: 'delta', text: 'Delta', 'item-class': 'class-delta' }
            ];

            return Future.pure(data);
          },
          // sink: sink,
          desc: 'demo-dropdown',
          onExecute: function (sandbox, item, itemValue) {
            console.log('*** dropdown demo execute on: ' + item.apis().getValue());
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
                tag: 'div',
                styles: {
                  background: 'blue'
                }
              }

            },
            item: {
              munge: function (spec) {
                return GuiTemplate.use(
                  TemplateMenuItem,
                  {
                    value: 'bird'
                  }, {
                    fields: spec
                  }
                );
              }
            }
            // menu: GuiTempalte.use(TemplateMenu)
            // dom: {
            //   tag: 'div'  
            // },
            // itemDefn: { }            
          },
          onExecute: function (sandbox, item, itemValue) {
            console.log('*** dropdown menu demo execute on: ' + item.apis().getValue() + ' ***');
          },
          fetch: function () {
            return Future.pure({
              primary: 'tools-menu',
              menus: {
                'tools-menu': [
                  { type: 'item', value: 'packages', text: 'Packages', 'item-class': '' },
                  { type: 'item', value: 'about', text: 'About', 'item-class': '' },
                  { 
                    type: 'widget',
                    value: 'widget',
                    'item-class': '',
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
                  { type: 'item', value: 'sortby', text: 'SortBy', 'item-class': '' }
                ],
                'sortby-menu': [
                  { type: 'item', value: 'strings', text: 'Strings', 'item-class': '' },
                  { type: 'item', value: 'numbers', text: 'Numbers', 'item-class': '' }
                ],
                'strings-menu': [
                  { type: 'item', value: 'version', text: 'Versions', html: '<b>V</b>ersions', 'item-class': '' },
                  { type: 'item', value: 'alphabetic', text: 'Alphabetic', 'item-class': '' }
                ],
                'numbers-menu': [
                  { type: 'item', value: 'doubled', text: 'Double digits', 'item-class': '' }
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