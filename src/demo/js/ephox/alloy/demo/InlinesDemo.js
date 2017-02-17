define(
  'ephox.alloy.demo.InlinesDemo',

  [
    'ephox.alloy.api.system.Gui',
    'ephox.alloy.api.component.GuiFactory',
    'ephox.alloy.api.behaviour.Positioning',
    'ephox.alloy.api.ui.Button',
    'ephox.alloy.api.ui.Container',
    'ephox.alloy.api.ui.InlineView',
    'ephox.alloy.api.ui.Input',
    'ephox.alloy.api.ui.TieredMenu',
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.demo.DemoSink',
    'ephox.alloy.demo.HtmlDisplay',
    'ephox.knoch.future.Future',
    'ephox.katamari.api.Fun',
    'ephox.perhaps.Option',
    'ephox.perhaps.Result',
    'ephox.sugar.api.properties.Class',
    'ephox.sugar.api.events.DomEvent',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.dom.Insert',
    'ephox.sugar.api.properties.Value',
    'global!document'
  ],

  function (Gui, GuiFactory, Positioning, Button, Container, InlineView, Input, TieredMenu, EventHandler, DemoSink, HtmlDisplay, Future, Fun, Option, Result, Class, DomEvent, Element, Insert, Value, document) {
    return function () {
      var gui = Gui.create();
      var body = Element.fromDom(document.body);
      Class.add(gui.element(), 'gui-root-demo-container');
      Insert.append(body, gui.element());

      var sink = DemoSink.make();


      var lazySink = function () {
        return Result.value(sink);
      };

      // Note, this should not in the GUI. It will be connected
      // when it opens.
      var inlineComp = GuiFactory.build(
        InlineView.sketch({
          uid: 'inline-comp',
          dom: {
            tag: 'div'
          },
          lazySink: Fun.constant(Result.value(sink))
        })
      );

      var inlineMenu = TieredMenu.sketch({
        dom: {
          tag: 'div'
        },

        fetch: function () {
          return Future.pure(
            Container.sketch({ })
          );
        },

        onEscape: function () {
          console.log('inline.menu.escape');
          return Option.some(true);
        },

        onExecute: function () {
          console.log('inline.menu.execute')
        },

        lazySink: lazySink,

        members: { 
          item: {
            munge: function (itemSpec) {
              return {
                dom: {
                  tag: 'div',
                  attributes: {
                    'data-value': itemSpec.data.value
                  },
                  classes: [ 'alloy-item' ],
                  innerHtml: itemSpec.data.text
                },
                components: [ ]
              };              
            }
          },
          menu: {
            munge: function (menuSpec) {
              return {
                dom: {
                  tag: 'div',
                  attributes: {
                    'data-value': menuSpec.value
                  },
                  classes: [ 'alloy-menu' ]
                },
                components: [ ],
                shell: true
              };
            }
          }
        },

        onOpenMenu: function (sandbox, menu) {
          // handled by inline view itself
        },

        onOpenSubmenu: function (sandbox, item, submenu) {
          var sink = lazySink().getOrDie();
          Positioning.position(sink, {
            anchor: 'submenu',
            item: item,
            bubble: Option.none()
          }, submenu);

        },

        data: {
          expansions: {
            'gamma': 'gamma-menu'
          },
          menus: {
            dog: {
              value: 'dog',
              items: [
                { type: 'item', data: { value: 'alpha', text: 'Alpha', 'item-class': 'alpha' } },
                { type: 'item', data: { value: 'beta', text: 'Beta', 'item-class': 'beta' } },
                { type: 'item', data: { value: 'gamma', text: 'Gamma', 'item-class': 'gamma' } },
                { type: 'item', data: { value: 'delta', text: 'Delta', 'item-class': 'delta' } }

              ],
              textkey: 'Dog'
            },
            'gamma-menu': {
              value: 'gamma-menu',
              items: [
                { type: 'item', data: { value: 'gamma-1', text: 'Gamma-1', 'item-class': 'gamma-1' } },
                { type: 'item', data: { value: 'gamma-2', text: 'Gamma-2', 'item-class': 'gamma-2' } },
              ],
              textkey: 'gamma-menu'
            }
          },
          primary: 'dog'
        },

        markers: {
          item: 'alloy-item',
          selectedItem: 'alloy-selected-item',
          menu: 'alloy-menu',
          selectedMenu: 'alloy-selected-menu',
          backgroundMenu: 'alloy-background-menu'
        }
      });

      gui.add(sink);      

      var onMousedown = DomEvent.bind(Element.fromDom(document), 'mousedown', function (evt) {
        gui.broadcastOn([ 'dismiss.popups' ], {
          target: evt.target()
        });
      });

      HtmlDisplay.section(
        gui,
        'This inline menu component is a context menu. Right click inside the yellow area',
        Container.sketch({
          dom: {
            styles: {
              background: '#ffff33',
              height: '100px'
            }
          },
          events: {
            contextmenu: EventHandler.nu({
              run: function (component, simulatedEvent) {
                simulatedEvent.event().kill();
                console.log('inlineMenu', inlineMenu);
                InlineView.showAt(inlineComp, {
                  anchor: 'makeshift',
                  x: simulatedEvent.event().x(),
                  y: simulatedEvent.event().y()
                }, inlineMenu);
              }
            })
          }
        })
      );
      

      HtmlDisplay.section(
        gui,
        'This inline toolbar shows up when you click in the second input field. Note, ' + 
        'how when you focus an empty input, it will attach at the end of the field, and ' +
        'when you focus a non-empty input, it will attach below',
        Container.sketch({
          behaviours: {
            keying: {
              mode: 'cyclic',
              selector: 'input'
            }
          },
          components: [
            Input.sketch({
              dom: {
                styles: { display: 'block', 'margin-bottom': '50px' }
              }
            }),
            Input.sketch({
              dom: {
                styles: { display: 'block' }
              },

              events: {
                focusin: EventHandler.nu({
                  run: function (input) {
                    var emptyAnchor = {
                      anchor: 'submenu',
                      item: input
                    };

                    var nonEmptyAnchor = {
                      anchor: 'selection',
                      root: gui.element()
                    };

                    var anchor = Value.get(input.element()).length > 0 ? nonEmptyAnchor : emptyAnchor;
                    InlineView.showAt(inlineComp, anchor, Container.sketch({
                      behaviours: {
                        keying: {
                          mode: 'flow',
                          selector: 'button'
                        }
                      },
                      components: [
                        Button.sketch({
                          dom: {
                            tag: 'button',
                            innerHtml: 'B'
                          },
                          action: function () { console.log('inline bold'); }
                        }),
                        Button.sketch({
                          dom: {
                            tag: 'button',
                            innerHtml: 'I'
                          },
                          action: function () { console.log('inline italic'); }
                        }),
                        Button.sketch({
                          dom: {
                            tag: 'button',
                            innerHtml: 'U'
                          },
                          action: function () { console.log('inline underline'); }
                        })
                      ]

                    }));
                  }
                })
              }
            })
          ]
        })
      );
    };
  }
);