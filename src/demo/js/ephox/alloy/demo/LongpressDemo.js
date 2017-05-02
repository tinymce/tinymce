define(
  'ephox.alloy.demo.LongpressDemo',

  [
    'ephox.alloy.api.behaviour.Positioning',
    'ephox.alloy.api.component.GuiFactory',
    'ephox.alloy.api.system.Attachment',
    'ephox.alloy.api.system.Gui',
    'ephox.alloy.api.ui.InlineView',
    'ephox.alloy.api.ui.TieredMenu',
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.demo.DemoSink',
    'ephox.alloy.demo.HtmlDisplay',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Option',
    'ephox.katamari.api.Result',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.properties.Class',
    'global!document'
  ],

  function (Positioning, GuiFactory, Attachment, Gui, InlineView, TieredMenu, EventHandler, DemoSink, HtmlDisplay, Fun, Option, Result, Element, Class, document) {
    return function () {
      var gui = Gui.create();
      var body = Element.fromDom(document.body);
      Class.add(gui.element(), 'gui-root-demo-container');
      Attachment.attachSystem(body, gui);

      var sink = DemoSink.make();
      gui.add(sink);

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

        onEscape: function () {
          console.log('inline.menu.escape');
          return Option.some(true);
        },

        onExecute: function () {
          console.log('inline.menu.execute')
        },
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
      
      var button1 = HtmlDisplay.section(
        gui,
        'This button is a <code>button</code> tag with an image',
        {
          dom: {
            tag: 'div'
          },
          components: [
            GuiFactory.premade(sink),
            {
              dom: {
                tag: 'button',
                innerHtml: 'Menu button'
              },
              events: {
                'longpress': EventHandler.nu({
                  run: function (component, simulatedEvent) {
                    console.log('simulatedEvent', simulatedEvent.event());
                    
                    InlineView.showAt(inlineComp, {
                      anchor: 'makeshift',
                      x: simulatedEvent.event().x(),
                      y: simulatedEvent.event().y()
                    }, inlineMenu);
                  }
                }),

                'touchmove': EventHandler.nu({
                  run: function (component, simulatedEvent) {
                    var e = simulatedEvent.event().raw().touches[0];
                    console.log('e', e.clientX, e.clientY);
                    var elem = Element.fromDom(document.elementFromPoint(e.clientX, e.clientY));
                    console.log('elem' ,elem);
                    // var elem = document.elementFromPoint(simulatedEvent.event().raw().touchX, simulatedEvent.event().raw().touchY
                    component.getSystem().triggerEvent('mouseover', elem, {
                      target: Fun.constant(elem),
                      x: Fun.constant(e.clientX),
                      y: Fun.constant(e.clientY)
                    });
                  }
                }),

                'touchend': EventHandler.nu({
                  run: function (component, simulatedEvent) {
                    InlineView.hide(inlineComp);
                  }
                })
              }
            }
          ]
        }
      );
    };
  }
);
