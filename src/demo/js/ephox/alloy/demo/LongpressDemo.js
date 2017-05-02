define(
  'ephox.alloy.demo.LongpressDemo',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Highlighting',
    'ephox.alloy.api.behaviour.Positioning',
    'ephox.alloy.api.behaviour.Unselecting',
    'ephox.alloy.api.component.GuiFactory',
    'ephox.alloy.api.component.Memento',
    'ephox.alloy.api.events.SystemEvents',
    'ephox.alloy.api.system.Attachment',
    'ephox.alloy.api.system.Gui',
    'ephox.alloy.api.ui.InlineView',
    'ephox.alloy.api.ui.Menu',
    'ephox.alloy.api.ui.TieredMenu',
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.demo.DemoSink',
    'ephox.alloy.demo.HtmlDisplay',
    'ephox.alloy.positioning.layout.Layout',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Option',
    'ephox.katamari.api.Result',
    'ephox.sugar.api.dom.Focus',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.node.Node',
    'ephox.sugar.api.properties.Class',
    'ephox.sugar.api.view.Height',
    'ephox.sugar.api.view.Location',
    'ephox.sugar.api.view.Width',
    'global!document'
  ],

  function (
    Behaviour, Highlighting, Positioning, Unselecting, GuiFactory, Memento, SystemEvents, Attachment, Gui, InlineView, Menu, TieredMenu, EventHandler, DemoSink,
    HtmlDisplay, Layout, Fun, Option, Result, Focus, Element, Node, Class, Height, Location, Width, document
  ) {
    return function () {
      var gui = Gui.create();
      var body = Element.fromDom(document.body);
      Class.add(gui.element(), 'gui-root-demo-container');
      Attachment.attachSystem(body, gui);

      var sink = DemoSink.make();
      // gui.add(sink);

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
        Menu.sketch({
          dom: {
            tag: 'div',
            styles: {
              display: 'flex'
            }
          },

          value: 'edit.view.menu',

          items: [
            { type: 'item', data: { value: 'alpha', text: 'Alpha', 'item-class': 'alpha' } },
            { type: 'item', data: { value: 'beta', text: 'Beta', 'item-class': 'beta' } }
          ],

          components: [
            Menu.parts().items()
          ],

          members: { 
            item: {
              munge: function (itemSpec) {
                return {
                  dom: {
                    tag: 'span',
                    attributes: {
                      'data-value': itemSpec.data.value
                    },
                    classes: [ 'alloy-orb' ]
                  },
                  components: [
                    {
                      dom: {
                        tag: 'span',
                        innerHtml: itemSpec.data.text
                      }
                    }
                  ]
                };              
              }
            }
          },

          markers: {
            item: 'alloy-orb',
            selectedItem: 'alloy-selected-orb'
          }
        })
      );
      
      var button1 = HtmlDisplay.section(
        gui,
        'Run this in touch device mode. It is a button that if you press and hold on it, it opens a circular menu below.',
        {
          dom: {
            tag: 'div'
          },
          components: [
            GuiFactory.premade(sink),
            {
              dom: {
                tag: 'span',
                innerHtml: 'Menu button',
                styles: {
                  padding: '1em',
                  display: 'inline-block',
                  'border-radius': '50%',
                  background: 'black',
                  color: 'white'
                }
              },
              behaviours: Behaviour.derive([
                Unselecting.config({ })
              ]),
              events: {
                'contextmenu': EventHandler.nu({
                  run: function (component, simulatedEvent) {
                    simulatedEvent.event().kill();
                  }
                }),

                'longpress': EventHandler.nu({
                  run: function (component, simulatedEvent) {
                    console.log('simulatedEvent', simulatedEvent.event());
                    var pos = Location.absolute(component.element());
                    var w = Width.get(component.element());
                    var h = Height.get(component.element());
                    InlineView.showAt(inlineComp, {
                      anchor: 'makeshift',
                      x: pos.left() + w/2,
                      y: pos.top() + h,
                      layouts: [ Layout.southmiddle, Layout.northmiddle ]
                      // hotspot: component
                    }, inlineMenu.asSpec());
                  }
                }),

                'touchmove': EventHandler.nu({
                  run: function (component, simulatedEvent) {
                    var e = simulatedEvent.event().raw().touches[0];
                    inlineMenu.getOpt(component).each(function (menu) {
                      Option.from(document.elementFromPoint(e.clientX, e.clientY)).map(Element.fromDom).filter(function (tgt) {
                        return menu.element().dom().contains(tgt.dom());
                      }).fold(function () {
                        console.log('no point');
                        inlineMenu.getOpt(component).each(Highlighting.dehighlightAll);
                        Focus.active().each(Focus.blur);
                      }, function (elem) {
                        component.getSystem().triggerEvent('mouseover', elem, {
                          target: Fun.constant(elem),
                          x: Fun.constant(e.clientX),
                          y: Fun.constant(e.clientY)
                        });
                      });
                      simulatedEvent.event().kill();
                    });
                  }
                }),

                'touchend': EventHandler.nu({
                  run: function (component, simulatedEvent) {
                    var e = simulatedEvent.event().raw().touches[0];
                    inlineMenu.getOpt(component).each(function (menu) {
                      Highlighting.getHighlighted(menu).each(function (item) {
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
