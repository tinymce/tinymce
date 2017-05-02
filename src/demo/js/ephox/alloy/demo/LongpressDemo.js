define(
  'ephox.alloy.demo.LongpressDemo',

  [
    'ephox.alloy.api.behaviour.Highlighting',
    'ephox.alloy.api.behaviour.Positioning',
    'ephox.alloy.api.component.GuiFactory',
    'ephox.alloy.api.component.Memento',
    'ephox.alloy.api.events.SystemEvents',
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

  function (
    Highlighting, Positioning, GuiFactory, Memento, SystemEvents, Attachment, Gui, InlineView, TieredMenu, EventHandler, DemoSink, HtmlDisplay, Fun, Option,
    Result, Element, Class, document
  ) {
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

      var inlineMenu = Memento.record(
        TieredMenu.sketch({
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
                    tag: 'span',
                    attributes: {
                      'data-value': itemSpec.data.value
                    },
                    classes: [ 'alloy-item' ],
                    innerHtml: itemSpec.data.text,
                    styles: {
                      background: 'black',
                      color: 'white',
                      'border-radius': '50%',
                      padding: '20px',
                      margin: '5px'
                    }
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
                    styles: {
                      display: 'flex'
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
            expansions: { },
            menus: {
              dog: {
                value: 'dog',
                items: [
                  { type: 'item', data: { value: 'alpha', text: 'Alpha', 'item-class': 'alpha' } },
                  { type: 'item', data: { value: 'beta', text: 'Beta', 'item-class': 'beta' } }

                ],
                textkey: 'Dog'
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
        })
      );
      
      var button1 = HtmlDisplay.section(
        gui,
        'This button is a <code>button</code> tag with an image',
        {
          dom: {
            tag: 'div'
          },
          components: [
            // GuiFactory.premade(sink),
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
                    }, inlineMenu.asSpec());
                  }
                }),

                'touchmove': EventHandler.nu({
                  run: function (component, simulatedEvent) {
                    var e = simulatedEvent.event().raw().touches[0];
                    var elem = Element.fromDom(document.elementFromPoint(e.clientX, e.clientY));
                    component.getSystem().triggerEvent('mouseover', elem, {
                      target: Fun.constant(elem),
                      x: Fun.constant(e.clientX),
                      y: Fun.constant(e.clientY)
                    });
                  }
                }),

                'touchend': EventHandler.nu({
                  run: function (component, simulatedEvent) {
                    var e = simulatedEvent.event().raw().touches[0];
                    inlineMenu.getOpt(component).each(function (menu) {
                      TieredMenu.getSelectedItem(menu).each(function (item) {
                        console.log('found item', item.element().dom());
                        component.getSystem().triggerEvent(SystemEvents.execute(), item.element(), {
                          target: Fun.constant(item.element())
                        });
                      });
                    });
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
