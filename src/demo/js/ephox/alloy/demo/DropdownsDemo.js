define(
  'ephox.alloy.demo.DropdownsDemo',

  [
    'ephox.alloy.api.Gui',
    'ephox.alloy.api.GuiFactory',
    'ephox.alloy.api.GuiTemplate',
    'ephox.alloy.demo.DemoTemplates',
    'ephox.alloy.demo.HtmlDisplay',
    'ephox.knoch.future.Future',
    'ephox.sugar.api.Class',
    'ephox.sugar.api.DomEvent',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Insert',
    'global!document',
    'text!dom-templates/demo.grid.item.html',
    'text!dom-templates/demo.menu.html',
    'text!dom-templates/demo.menu.item.html',
    'text!dom-templates/demo.menu.separator.html',
    'text!dom-templates/demo.toolbar.dropdown.html',
    'text!dom-templates/demo.toolbar.split-dropdown.html',
    'text!dom-templates/demo.widget.container.html',
    'text!dom-templates/dropdown-alpha.html'
  ],

  function (Gui, GuiFactory, GuiTemplate, DemoTemplates, HtmlDisplay, Future, Class, DomEvent, Element, Insert, document, TemplateGridItem, TemplateMenu, TemplateMenuItem, TemplateMenuSeparator, TemplateToolbarDropdown, TemplateToolbarSplitButton, TemplateWidgetContainer, TemplateInlineDropdown) {
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
        'Thi is a split-button dropdown',
        GuiTemplate.use(
          TemplateToolbarSplitButton,
          { 
            uiType: 'split-dropdown',
            toggleClass: 'demo-selected',
            fetch: function () {
              return Future.pure({
                uiType: 'container',
                components: [
                  { uiType: 'input'}
                ]

              });
            },
            sink: sink,
            onExecute: function () {

            },

            parts: {
              button: {
                uiType: 'button',
                dom: {
                  tag: 'button',
                  innerHtml: 'Run'
                },
                action: function () {
                  console.log('*** Clicked on Action ***');
                },
                uid: 'supplied'
              },
              arrow: {
                uiType: 'button',
                dom: {
                  tag: 'button',
                  innerHtml: 'v'
                }
              }
            },
            view: {
              style: 'widget',
              members: {
                container: {
                  munge: function (spec) {
                    return GuiTemplate.use(
                      TemplateWidgetContainer,
                      { },
                      { }
                    );
                  }
                }
              }
            }
          },
          {

          }
        )
      );

      return;


      HtmlDisplay.section(
        gui,
        'This dropdown is custom',
        GuiTemplate.use(
          TemplateInlineDropdown,
          {
            uiType: 'dropdown-alpha',
            parts: {
              button: {
                buttonType: 'custom',
                config: {
                  dom: {
                    innerHtml: 'Text'                  
                  },
                  components: [ ]
                }
              }
            }
          },
          {

          }
        )
      );


      var x = HtmlDisplay.section(
        gui,
        'This dropdown button shows a widget',
        GuiTemplate.use(
          TemplateToolbarDropdown,
          {
            uiType: 'dropdown-widget',
            sink: sink,
            members: {
              container: {
                munge: function (spec) {
                  return GuiTemplate.use(
                    TemplateWidgetContainer,
                    { },
                    { }
                  );
                }
              }
            },
            fetchWidget: function () {
              return Future.pure({
                uiType: 'container',
                dom: {
                  classes: [ 'my-widget' ]
                },
                keying: { mode: 'cyclic' },
                components: [
                  { uiType: 'input' }
                ]
              });
            }
          }, { 

          }
        )
      );

      // x.apis().showValue('dog');
      // console.log('x', x.element().dom());

      // return;

      HtmlDisplay.section(
        gui,
        'This grid dropdown button is a grid of 3 x 2',
        {
          uiType: 'dropdown-grid',
          text: 'Dropdown',
          dom: {
            tag: 'button',
            innerHtml: 'Click me to expand'
          },
          markers: {
            item: 'alloy-item',
            selectedItem: 'alloy-selected-item',
            menu: 'alloy-menu',
            selectedMenu: 'alloy-selected-menu'
          },
          members: {
            item: {
              munge: function (spec) {
                return GuiTemplate.use(
                  TemplateGridItem,
                  { },
                  {
                    fields: spec
                  }
                );
              }
            },
            grid: {
              munge: function (spec) {
                return GuiTemplate.use(
                  TemplateMenu,
                  { },
                  {
                    fields: {
                      'aria-label': spec.textkey || 'TEMPORARY_HACK'
                    }
                  }
                );
              }
            }
          },
          fetchItems: function () {

            var data = [
              { type: 'item', value: 'alpha', text: '+Alpha', 'item-class': 'class-alpha' },
              { type: 'item', value: 'beta', text: '+Beta', 'item-class': 'class-beta' },
              { type: 'item', value: 'gamma', text: '+Gamma', 'item-class': 'class-gamma' },
              { type: 'item', value: 'delta', text: '+Delta', 'item-class': 'class-delta' }
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
        'This dropdown button has four possible values: alpha, beta, gamma, and delta',
        {
          uiType: 'dropdown-list',
          text: 'Dropdown',
          dom: {
            tag: 'button',
            innerHtml: 'Click me to expand'
          },
          markers: {
            item: 'alloy-item',
            selectedItem: 'alloy-selected-item',
            menu: 'alloy-menu',
            selectedMenu: 'alloy-selected-menu'
          },
          members: {
            menu: {
              munge: function (spec) {
                return GuiTemplate.use(
                  TemplateMenu,
                  { },
                  {
                    fields: {
                      'aria-label': spec.textkey
                    }
                  }
                );
              }
            },
            item: {
              munge: function (spec) {
                return DemoTemplates.item(spec);
              }
            }
          },
          fetchItems: function () {

            var data = [
              { type: 'item', value: 'alpha', text: 'Alpha', 'item-class': 'class-alpha' },
              { type: 'item', value: 'beta', text: 'Beta', 'item-class': 'class-beta' },
              { type: 'separator', value: 'text' },
              { type: 'item', value: 'gamma', text: 'Gamma', 'item-class': 'class-gamma' },
              { type: 'item', value: 'delta', text: 'Delta', 'item-class': 'class-delta' }
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
          uiType: 'dropdown-menu',
          dom: {
            tag: 'button',
            innerHtml: '+'
          },
          sink: sink,
          markers: {
            item: 'alloy-item',
            selectedItem: 'alloy-selected-item',
            menu: 'alloy-menu',
            selectedMenu: 'alloy-selected-menu'
          },
          members: {
            menu: {
              munge: function (spec) {
                return GuiTemplate.use(
                  TemplateMenu,
                  { },
                  {
                    fields: {
                      'aria-label': spec.textkey
                    }
                  }
                );
              }
            },
            item: {
              munge: function (spec) {
                return DemoTemplates.item(spec);
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
                'tools-menu': {
                  textkey: 'tools-menu',
                  items: [
                    { type: 'item', value: 'packages', text: 'Packages', 'item-class': '' },
                    { type: 'item', value: 'about', text: 'About', 'item-class': '' },
                    { 
                      type: 'widget',
                      value: 'widget',
                      text: 'Widget',
                      widget: {
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
                  ]
                },
                'packages-menu': {
                  textkey: 'packages',
                  items: [
                    { type: 'item', value: 'sortby', text: 'SortBy', 'item-class': '' }
                  ]
                },
                'sortby-menu': {
                  textkey: 'sortby',
                  items: [
                    { type: 'item', value: 'strings', text: 'Strings', 'item-class': '' },
                    { type: 'item', value: 'numbers', text: 'Numbers', 'item-class': '' }
                  ]
                },
                'strings-menu': {
                  textkey: 'strings',
                  items: [
                    { type: 'item', value: 'version', text: 'Versions', html: '<b>V</b>ersions', 'item-class': '' },
                    { type: 'item', value: 'alphabetic', text: 'Alphabetic', 'item-class': '' }
                  ]
                },
                'numbers-menu': {
                  textkey: 'numbers',
                  items: [
                    { type: 'item', value: 'doubled', text: 'Double digits', 'item-class': '' }
                  ]
                }
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