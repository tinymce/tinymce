define(
  'ephox.alloy.demo.DropdownsDemo',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Representing',
    'ephox.alloy.api.system.Gui',
    'ephox.alloy.api.ui.Button',
    'ephox.alloy.api.ui.Container',
    'ephox.alloy.api.ui.Dropdown',
    'ephox.alloy.api.ui.Input',
    'ephox.alloy.api.ui.ItemWidget',
    'ephox.alloy.api.ui.Menu',
    'ephox.alloy.api.ui.SplitDropdown',
    'ephox.alloy.api.ui.TieredMenu',
    'ephox.alloy.demo.DemoSink',
    'ephox.alloy.demo.HtmlDisplay',
    'ephox.knoch.future.Future',
    'ephox.perhaps.Result',
    'ephox.sugar.api.properties.Class',
    'ephox.sugar.api.events.DomEvent',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.dom.Insert',
    'global!document'
  ],

  function (Behaviour, Representing, Gui, Button, Container, Dropdown, Input, ItemWidget, Menu, SplitDropdown, TieredMenu, DemoSink, HtmlDisplay, Future, Result, Class, DomEvent, Element, Insert, document) {
    return function () {
      var gui = Gui.create();
      var body = Element.fromDom(document.body);
      Class.add(gui.element(), 'gui-root-demo-container');
      // Css.set(gui.element(), 'direction', 'rtl');

      Insert.append(body, gui.element());


      var sink = DemoSink.make();

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
                  Menu.parts().items()
                ]
              };
            }
          },
          item: {
            munge: function (spec) {
              return {
                dom: {
                  tag: 'div',
                  classes: [ 'alloy-item' ]
                },
                components: [
                  ItemWidget.parts().widget()
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
                dom: {
                  tag: 'div',
                  classes: [ 'alloy-item' ]
                },

                components: [
                  ItemWidget.parts().widget()
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
        SplitDropdown.sketch({
          toggleClass: 'demo-selected',
          dom: {
            tag: 'div'
          },
          components: [ 
            SplitDropdown.parts().button(),
            SplitDropdown.parts().arrow(),
            SplitDropdown.parts().sink()
          ],
          fetch: function () {
            var future = Future.pure({             
              type: 'widget',
              autofocus: true,
              data: {
                value: 'widget1',
                text: 'Widget1'
              },
              widget: Container.sketch({
                dom: {
                  classes: [ 'my-widget' ]
                },
                behaviours: {
                  keying: { mode: 'cyclic' }
                },
                components: [
                  Input.sketch({ dom: { tag: 'input' } }),
                  Input.sketch({ dom: { tag: 'input' } })
                ]
              })

            });

            return future.map(function (f) {
              return TieredMenu.singleData('name', 'label', f);
            });
          },
          lazySink: lazySink,
          onExecute: function () {
            console.log('split-dropdown button clicked');
          },
          parts: {
            button: {
              dom: {
                tag: 'button',
                innerHtml: 'Run'
              },
              uid: 'supplied'
            },
            arrow: {
              dom: {
                tag: 'button',
                innerHtml: 'v'
              }
            },
            menu: widgetMenu,
            sink: { }
          }
        })
      );

      var x = HtmlDisplay.section(
        gui,
        'This dropdown button shows a widget',
        Dropdown.sketch({
          lazySink: lazySink,

          toggleClass: 'demo-selected',

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
              widget: Container.sketch({
                dom: {
                  classes: [ 'my-widget' ]
                },
                behaviours: {
                  keying: { mode: 'cyclic' }
                },
                components: [
                  Input.sketch({ }),
                  Input.sketch({ })
                ]
              })
            });

            return future.map(function (data) {
              return TieredMenu.singleData('primary-menu', 'Widget', data);
            });
          }
        })
      );

      HtmlDisplay.section(
        gui,
        'This grid dropdown button is a grid of 2 x 2',
        Dropdown.sketch({
          text: 'Dropdown',
          dom: {
            tag: 'div',
            innerHtml: 'here'
          },
          components: [
            
          ],

          toggleClass: 'demo-selected',

          name: 'grid-demo',

          parts: {
            menu: gridMenu
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
              return TieredMenu.simpleData('grid-list', 'Grid List', items);  
            });
          },
         
          lazySink: lazySink
        })
      );



      HtmlDisplay.section(
        gui,
        'This dropdown button has four possible values: alpha, beta, gamma, and delta AND an internal sink',
        Dropdown.sketch({
          dom: {
            tag: 'button',
            innerHtml: 'Click me to expand'
          },
          components: [
            Dropdown.parts().sink()
          ],

          toggleClass: 'demo-selected',

          parts: {
            menu: listMenu,
            sink: { }
          },
          lazySink: lazySink,

          matchWidth: true,

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
              return TieredMenu.simpleData('basic-list', 'Basic List', items);
            });
          },
          onExecute: function (sandbox, item, itemValue) {
            console.log('*** dropdown demo execute on: ' + Representing.getValue(item));
          }
        })
      );

      HtmlDisplay.section(
        gui,
        'This dropdown menu has an intricate menu system derived from Sublime sorting',
        Dropdown.sketch({
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

          toggleClass: 'demo-selected',

          onExecute: function (sandbox, item, itemValue) {
            console.trace();
            console.log('*** dropdown menu demo execute on: ' + Representing.getValue(item).value + ' ***');
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
                      widget: Container.sketch({
                        dom: {
                          tag: 'div'
                        },
                        components: [
                          Input.sketch({
                            dom: {
                              tag: 'input',
                              styles: {
                                display: 'inline-block',
                                width: '50px'
                              }
                            },
                            useTabstop: true
                          }),
                          Container.sketch({
                            components: [
                              Button.sketch({
                                action: function () { console.log('clicked on a button', arguments); },
                                dom: {
                                  tag: 'button',
                                  innerHtml: '-'
                                },
                                behaviours: {
                                  tabstopping: Behaviour.revoke()
                                }
                              }),
                              Button.sketch({
                                action: function () { console.log('clicked on a button', arguments); },
                                dom: {
                                  tag: 'button',
                                  innerHtml: '+'
                                },
                                behaviours: {
                                  tabstopping: Behaviour.revoke()
                                }
                              })
                            ],
                            behaviours: {
                              tabstopping: true,
                              keying: {
                                mode: 'flow',
                                selector: 'button'
                              }
                            }
                          })
                        ],
                        behaviours: {
                          keying: {
                            mode: 'cyclic'
                          }
                        }
                      })
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
              return TieredMenu.tieredData(f.primary, f.menus, f.expansions);
            });
          }
        })
      );
    };
  }
);