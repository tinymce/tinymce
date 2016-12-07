define(
  'ephox.alloy.demo.DropdownsDemo',

  [
    'ephox.alloy.api.Gui',
    'ephox.alloy.api.GuiFactory',
    'ephox.alloy.api.GuiTemplate',
    'ephox.alloy.api.behaviour.Representing',
    'ephox.alloy.api.ui.Dropdown',
    'ephox.alloy.api.ui.DropdownApis',
    'ephox.alloy.api.ui.SplitDropdown',
    'ephox.alloy.api.ui.menus.MenuData',
    'ephox.alloy.demo.DemoTemplates',
    'ephox.alloy.demo.HtmlDisplay',
    'ephox.knoch.future.Future',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.perhaps.Result',
    'ephox.sugar.api.Class',
    'ephox.sugar.api.DomEvent',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Html',
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

  function (Gui, GuiFactory, GuiTemplate, Representing, Dropdown, DropdownApis, SplitDropdown, MenuData, DemoTemplates, HtmlDisplay, Future, Fun, Option, Result, Class, DomEvent, Element, Html, Insert, document, TemplateGridItem, TemplateMenu, TemplateMenuItem, TemplateMenuSeparator, TemplateToolbarDropdown, TemplateToolbarSplitButton, TemplateWidgetContainer, TemplateInlineDropdown) {
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
        behaviours: {
          positioning: {
            useFixed: true
          }
        }
      });

      gui.add(sink);      

      console.log('sink', sink.element());

      var onMousedown = DomEvent.bind(Element.fromDom(document), 'mousedown', function (evt) {
        gui.broadcastOn([ 'dismiss.popups' ], {
          target: evt.target()
        });
      });

      var lazySink = function () {
        return Result.value(sink);
      };


      var menuMarkers = {
        selectedItem: 'no-selection',
        item: 'alloy-item',
        menu: 'no-selection',
        selectedMenu: 'alloy-menu',
        backgroundMenu: 'no-selection'
      };

      var widgetMenu = {
        members: {
          menu: {
            munge: function (spec) {
              return {
                dom: {
                  tag: 'div'
                },
                components: [
                  { uiType: 'placeholder', name: '<alloy.menu.items>', owner: 'dropdown-list' }
                ]
              };
            }
          },
          item: {
            munge: function (spec) {
              return {
                uiType: 'container',
                dom: {
                  tag: 'div',
                  classes: [ 'alloy-item' ]
                },
                components: [
                  { uiType: 'placeholder', name: '<alloy.item.widget>', owner: 'item-widget' }
                ]
              };
            }
          }
        },
        markers: menuMarkers
      };

      var gridMenu = {
        members: {
          item: {
            munge: function (spec) {
              return {
                uiType: 'custom',
                dom: {
                  tag: 'span',
                  classes: [ 'alloy-item' ],
                  innerHtml: spec.data.text,
                  styles: {
                    'display': 'inline-block',
                    width: '50px'
                  }
                },
                components: [ ]
              };
            }
          },

          menu: {
            munge: function (spec) {
              return {
                uiType: 'container',
                movement: {
                  mode: 'grid',
                  initSize: {
                    numColumns: 2,
                    numRows: 2
                  }
                },
                dom: {
                  tag: 'div',
                  classes: [ 'demo-alloy-menu' ],
                  styles: {
                    width: '100px'
                  }
                },
                shell: true,
                components: [ ]
              };
            }
          }
        },

        markers: menuMarkers
      };

      var listMenu = {
        members: {
          menu: {
            munge: function (spec) {
              return {
                dom: {
                  tag: 'ol',
                  attributes: {
                    'aria-label': spec.text
                  },
                  classes: [ 'demo-alloy-menu' ]
                },
                shell: true,
                components: [ ]
              };
            }
          },
          item: {
            munge: function (spec) {

              return spec.type === 'widget' ? {
                uiType: 'container',
                dom: {
                  tag: 'div',
                  classes: [ 'alloy-item' ]
                },

                components: [
                 { uiType: 'placeholder', name: '<alloy.item.widget>', owner: 'item-widget' }
                ]
              } : {
                dom: {
                  tag: 'li',
                  classes: spec.type === 'item' ? [ 'alloy-item' ] : [ ],
                  innerHtml: spec.data.text
                },
                components: [

                ]
              };
            }
          }
        },
        markers: menuMarkers
      };

      HtmlDisplay.section(
        gui,
        'Thi is a split-button dropdown',
        SplitDropdown.build(function (parts) {
          return { 
            toggleClass: 'demo-selected',
            dom: {
              tag: 'div'
            },
            components: [ parts.button().placeholder(), parts.arrow().placeholder(), parts.sink().placeholder() ],
            fetch: function () {
              var future = Future.pure({             
                type: 'widget',
                autofocus: true,
                data: {
                  value: 'widget1',
                  text: 'Widget1'
                },
                widget: {
                  uiType: 'container',
                  dom: {
                    classes: [ 'my-widget' ]
                  },
                  behaviours: {
                    keying: { mode: 'cyclic' }
                  },
                  components: [
                    { uiType: 'input' },
                    { uiType: 'input' }
                  ]
                }

              });

              return future.map(function (f) {
                return MenuData.single('name', 'label', f);
              });
            },
            lazySink: lazySink,
            onExecute: function () {

            },

            parts: {
              button: parts.button().build({
                uiType: 'button',
                dom: {
                  tag: 'button',
                  innerHtml: 'Run'
                },
                action: function () {
                  console.log('*** Clicked on Action ***');
                },
                uid: 'supplied'
              }),
              arrow: parts.arrow().build({
                uiType: 'button',
                dom: {
                  tag: 'button',
                  innerHtml: 'v'
                }
              }),
              menu: parts.menu().build(widgetMenu),
              sink: parts.sink().build({ })
            }
          };
        })
      );


   
      var x = HtmlDisplay.section(
        gui,
        'This dropdown button shows a widget',
        Dropdown.build(function (parts) {
          return {
            lazySink: lazySink,

            dom: {
              tag: 'div',
              innerHtml: 'Dropdown widget'
            },

            parts: {
              menu: widgetMenu
            },
            
            fetch: function () {
              var future = Future.pure({
                type: 'widget',
                autofocus: true,
                data: {
                  value: 'widget1',
                  text: 'Widget1'
                },
                widget: {
                  uiType: 'container',
                  dom: {
                    classes: [ 'my-widget' ]
                  },
                  behaviours: {
                    keying: { mode: 'cyclic' }
                  },
                  components: [
                    { uiType: 'input' },
                    { uiType: 'input' }
                  ]
                }
              });

              return future.map(function (data) {
                return MenuData.single('primary-menu', 'Widget', data);
              });
            }
          };
        })
      );



      // DropdownApis.showValue(x, 'dog');

      // console.log('x', x.element().dom());

      // // return;

      HtmlDisplay.section(
        gui,
        'This grid dropdown button is a grid of 2 x 2',
        Dropdown.build(function (parts) {
          return {
            text: 'Dropdown',
            dom: {
              tag: 'div',
              innerHtml: 'here'
            },
            components: [
              
            ],

            name: 'grid-demo',

            parts: {
              menu: parts.menu().build(gridMenu)
            },
            fetch: function () {

              var data = [
                { type: 'item', data: { value: 'alpha', text: '+Alpha' } },
                { type: 'item', data: { value: 'beta', text: '+Beta' } },
                { type: 'item', data: { value: 'gamma', text: '+Gamma' } },
                { type: 'item', data: { value: 'delta', text: '+Delta' } }
              ];
              var future = Future.pure(data);
              return future.map(function (items) {
                return MenuData.simple('grid-list', 'Grid List', items);  
              });
            },
           
            lazySink: lazySink
          };
        })
      );



      HtmlDisplay.section(
        gui,
        'This dropdown button has four possible values: alpha, beta, gamma, and delta',
        Dropdown.build(function (parts) {
          return {
            dom: {
              tag: 'button',
              innerHtml: 'Click me to expand'
            },
            components: [ parts.sink().placeholder() ],


            name: 'dropdown-list-demo',

            parts: {
              menu: parts.menu().build(listMenu),
              sink: parts.sink().build({ })
            },
            lazySink: lazySink,
            fetch: function () {

              var data = [
                { type: 'item', data: { value: 'alpha', text: 'Alpha' }, 'item-class': 'class-alpha' },
                { type: 'item', data: { value: 'beta', text: 'Beta' }, 'item-class': 'class-beta' },
                { type: 'separator', data: { value: 'text' } },
                { type: 'item', data: { value: 'gamma', text: 'Gamma' }, 'item-class': 'class-gamma' },
                { type: 'item', data: { value: 'delta', text: 'Delta' }, 'item-class': 'class-delta' }
              ];

              var future = Future.pure(data);
              return future.map(function (items) {
                return MenuData.simple('basic-list', 'Basic List', items);
              });
            },
            // sink: sink,
            desc: 'demo-dropdown',
            onExecute: function (sandbox, item, itemValue) {
              console.log('*** dropdown demo execute on: ' + Representing.getValue(item));
            }
          };
        })
      );

      HtmlDisplay.section(
        gui,
        'This dropdown menu has an intricate menu system derived from Sublime sorting',
        Dropdown.build(function (parts) {
          return {
            dom: {
              tag: 'div',
              innerHtml: '+'
            },
            components: [
              
            ],
            lazySink: lazySink,
            parts: {
              menu: listMenu
            },

            onExecute: function (sandbox, item, itemValue) {
              console.trace();
              console.log('*** dropdown menu demo execute on: ' + Representing.getValue(item) + ' ***');
            },
            fetch: function () {
              var future = Future.pure({
                primary: 'tools-menu',
                menus: {
                  'tools-menu': {
                    text: 'tools-menu',
                    items: [
                      { type: 'item', data: { value: 'packages', text: 'Packages' }, 'item-class': '' },
                      { type: 'item', data: { value: 'about', text: 'About' }, 'item-class': '' },
                      { 
                        type: 'widget',
                        data: {
                          value: 'widget',
                          text: 'Widget'
                        },
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
                              },
                              behaviours: {
                                tabstopping: true
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
                                  behaviours: {
                                    // FIX: This is required to override a previous tabstopping.
                                    tabstopping: undefined
                                  }
                                },
                                {
                                  uiType: 'button',
                                  action: function () { console.log('clicked on a button', arguments); },
                                  dom: {
                                    tag: 'button',
                                    innerHtml: '+'
                                  },
                                  behaviours: {
                                    tabstopping: undefined
                                  }
                                }
                              ],
                              behaviours: {
                                tabstopping: true,
                                keying: {
                                  mode: 'flow',
                                  selector: 'button'
                                }
                              }
                            }
                          ],
                          behaviours: {
                            keying: {
                              mode: 'cyclic'
                            }
                          }
                        }
                      }
                    ]
                  },
                  'packages-menu': {
                    text: 'packages',
                    items: [
                      { type: 'item', data: { value: 'sortby', text: 'SortBy' }, 'item-class': '' }
                    ]
                  },
                  'sortby-menu': {
                    text: 'sortby',
                    items: [
                      { type: 'item', data: { value: 'strings', text: 'Strings' }, 'item-class': '' },
                      { type: 'item', data: { value: 'numbers', text: 'Numbers' }, 'item-class': '' }
                    ]
                  },
                  'strings-menu': {
                    text: 'strings',
                    items: [
                      { type: 'item', data: { value: 'version', text: 'Versions', html: '<b>V</b>ersions' }, 'item-class': '' },
                      { type: 'item', data: { value: 'alphabetic', text: 'Alphabetic' }, 'item-class': '' }
                    ]
                  },
                  'numbers-menu': {
                    text: 'numbers',
                    items: [
                      { type: 'item', data: { value: 'doubled', text: 'Double digits' }, 'item-class': '' }
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

              return future.map(function (f) {
                return MenuData.tiered(f.primary, f.menus, f.expansions);
              });
            }
          };
        })
      );
    };
  }
);