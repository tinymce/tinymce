define(
  'ephox.alloy.demo.DropdownsDemo',

  [
    'ephox.alloy.api.Gui',
    'ephox.alloy.api.GuiFactory',
    'ephox.alloy.api.GuiTemplate',
    'ephox.alloy.api.behaviour.Representing',
    'ephox.alloy.api.ui.DropdownApis',
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

  function (Gui, GuiFactory, GuiTemplate, Representing, DropdownApis, DemoTemplates, HtmlDisplay, Future, Fun, Option, Result, Class, DomEvent, Element, Html, Insert, document, TemplateGridItem, TemplateMenu, TemplateMenuItem, TemplateMenuSeparator, TemplateToolbarDropdown, TemplateToolbarSplitButton, TemplateWidgetContainer, TemplateInlineDropdown) {
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

      // HtmlDisplay.section(
      //   gui,
      //   'Thi is a split-button dropdown',
      //   GuiTemplate.use(
      //     Option.some('split-dropdown'),
      //     TemplateToolbarSplitButton,
      //     { 
      //       uiType: 'split-dropdown',
      //       toggleClass: 'demo-selected',
      //       fetch: function () {
      //         return Future.pure({
      //           uiType: 'container',
      //           components: [
      //             { uiType: 'input'}
      //           ]

      //         });
      //       },
      //       lazySink: lazySink,
      //       onExecute: function () {

      //       },

      //       parts: {
      //         button: {
      //           uiType: 'button',
      //           dom: {
      //             tag: 'button',
      //             innerHtml: 'Run'
      //           },
      //           action: function () {
      //             console.log('*** Clicked on Action ***');
      //           },
      //           uid: 'supplied'
      //         },
      //         arrow: {
      //           uiType: 'button',
      //           dom: {
      //             tag: 'button',
      //             innerHtml: 'v'
      //           }
      //         }
      //       },
      //       view: {
      //         style: 'widget',
      //         scaffold: Fun.identity,
      //         members: {
      //           container: {
      //             munge: function (spec) {
      //               return GuiTemplate.use(
      //                 Option.some('widget-container'),
      //                 TemplateWidgetContainer,
      //                 { },
      //                 { }
      //               );
      //             }
      //           }
      //         }
      //       }
      //     },
      //     {

      //     }
      //   )
      // );

   
      // var x = HtmlDisplay.section(
      //   gui,
      //   'This dropdown button shows a widget',
      //   GuiTemplate.use(
      //     Option.some('dropdown-widget'),
      //     TemplateToolbarDropdown,
      //     {
      //       uiType: 'dropdown-widget',
      //       lazySink: lazySink,

      //       scaffold: Fun.identity,
      //       members: {
      //         container: {
      //           munge: function (spec) {
      //             return GuiTemplate.use(
      //               Option.some('widget-container'),
      //               TemplateWidgetContainer,
      //               { },
      //               { }
      //             );
      //           }
      //         }
      //       },
      //       parts: {
      //         display: {
      //           dom: {
      //             tag: 'button',
      //             innerHtml: 'here'
      //           },
      //           representing: {
      //             query: function (comp) {

      //             },
      //             set: function (comp, v) {
      //               Html.set(comp.element(), v);
      //             }
      //           }
      //         }
      //       },
      //       fetch: function () {
      //         return Future.pure({
      //           uiType: 'container',
      //           dom: {
      //             classes: [ 'my-widget' ]
      //           },
      //           keying: { mode: 'cyclic' },
      //           components: [
      //             { uiType: 'input' }
      //           ]
      //         });
      //       }
      //     }, { 

      //     }
      //   )
      // );



      // DropdownApis.showValue(x, 'dog');

      // console.log('x', x.element().dom());

      // // return;

      HtmlDisplay.section(
        gui,
        'This grid dropdown button is a grid of 2 x 2',
        {
          uiType: 'dropdown-list',
          text: 'Dropdown',
          dom: {
            tag: 'div',
            innerHtml: 'here'
          },
          components: [
            
          ],

          name: 'grid-demo',

          scaffold: Fun.identity,
          markers: {
            item: 'alloy-item',
            selectedItem: 'alloy-selected-item',
            menu: 'demo-alloy-menu',
            selectedMenu: 'alloy-selected-menu',
            backgroundMenu: 'alloy-background-menu'
          },
          initSize: {
            numColumns: 2,
            numRows: 2
          },
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
          fetch: function () {

            var data = [
              { type: 'item', data: { value: 'alpha', text: '+Alpha' } },
              { type: 'item', data: { value: 'beta', text: '+Beta' } },
              { type: 'item', data: { value: 'gamma', text: '+Gamma' } },
              { type: 'item', data: { value: 'delta', text: '+Delta' } }
            ];
            return Future.pure(data);
          },
         
          lazySink: lazySink
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
          components: [
            
          ],


          name: 'dropdown-list-demo',
          scaffold: Fun.identity,
          markers: {
            item: 'alloy-item',
            selectedItem: 'alloy-selected-item',
            menu: 'demo-alloy-menu',
            selectedMenu: 'alloy-selected-menu',
            backgroundMenu: 'alloy-background-menu'
          },
          members: {
            menu: {
              munge: function (spec) {
                return {
                  dom: {
                    tag: 'ol',
                    attributes: {
                      'aria-label': spec.textkey
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
                return {
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
          parts: {
            display: {
              dom: {
                tag: 'div'
              },
              representing: {
                query: function (comp) {

                },
                set: function (comp, v) {
                  Html.set(comp.element(), v);
                }
              }
            }
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

            return Future.pure(data);
          },
          // sink: sink,
          desc: 'demo-dropdown',
          onExecute: function (sandbox, item, itemValue) {
            console.log('*** dropdown demo execute on: ' + Representing.getValue(item));
          }
        }
      );

      HtmlDisplay.section(
        gui,
        'This dropdown menu has an intricate menu system derived from Sublime sorting',
        {
          uiType: 'dropdown-menu',
          dom: {
            tag: 'div',
            innerHtml: '+'
          },
          components: [
            
          ],
          lazySink: lazySink,
          markers: {
            item: 'alloy-item',
            selectedItem: 'alloy-selected-item',
            menu: 'demo-alloy-menu',
            selectedMenu: 'alloy-selected-menu',
            backgroundMenu: 'background-menu'
          },
          
          members: {
            menu: {
              munge: function (spec) {
                return {
                  dom: {
                    tag: 'ol',
                    attributes: {
                      'aria-label': spec.textkey
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

          onExecute: function (sandbox, item, itemValue) {
            console.trace();
            console.log('*** dropdown menu demo execute on: ' + Representing.getValue(item) + ' ***');
          },
          fetch: function () {
            return Future.pure({
              primary: 'tools-menu',
              menus: {
                'tools-menu': {
                  textkey: 'tools-menu',
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
                  textkey: 'packages',
                  items: [
                    { type: 'item', data: { value: 'sortby', text: 'SortBy' }, 'item-class': '' }
                  ]
                },
                'sortby-menu': {
                  textkey: 'sortby',
                  items: [
                    { type: 'item', data: { value: 'strings', text: 'Strings' }, 'item-class': '' },
                    { type: 'item', data: { value: 'numbers', text: 'Numbers' }, 'item-class': '' }
                  ]
                },
                'strings-menu': {
                  textkey: 'strings',
                  items: [
                    { type: 'item', data: { value: 'version', text: 'Versions', html: '<b>V</b>ersions' }, 'item-class': '' },
                    { type: 'item', data: { value: 'alphabetic', text: 'Alphabetic' }, 'item-class': '' }
                  ]
                },
                'numbers-menu': {
                  textkey: 'numbers',
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
          }
        }
      );
    };
  }
);