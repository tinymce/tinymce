define(
  'ephox.alloy.demo.LongpressDemo',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Highlighting',
    'ephox.alloy.api.behaviour.Positioning',
    'ephox.alloy.api.behaviour.Sliding',
    'ephox.alloy.api.behaviour.Toggling',
    'ephox.alloy.api.behaviour.Transitioning',
    'ephox.alloy.api.behaviour.Unselecting',
    'ephox.alloy.api.component.GuiFactory',
    'ephox.alloy.api.component.Memento',
    'ephox.alloy.api.events.SystemEvents',
    'ephox.alloy.api.system.Attachment',
    'ephox.alloy.api.system.Gui',
    'ephox.alloy.api.ui.InlineView',
    'ephox.alloy.api.ui.Menu',
    'ephox.alloy.api.ui.TieredMenu',
    'ephox.alloy.api.ui.TouchMenu',
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.debugging.Debugging',
    'ephox.alloy.demo.DemoSink',
    'ephox.alloy.demo.HtmlDisplay',
    'ephox.alloy.positioning.layout.Layout',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Future',
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
    Behaviour, Highlighting, Positioning, Sliding, Toggling, Transitioning, Unselecting, GuiFactory, Memento, SystemEvents, Attachment, Gui, InlineView, Menu,
    TieredMenu, TouchMenu, EventHandler, Debugging, DemoSink, HtmlDisplay, Layout, Fun, Future, Option, Result, Focus, Element, Node, Class, Height, Location,
    Width, document
  ) {
    return function () {
      var gui = Gui.create();
      Debugging.registerInspector('gui', gui);

      var body = Element.fromDom(document.body);
      Class.add(gui.element(), 'gui-root-demo-container');
      Attachment.attachSystem(body, gui);

      var sink = DemoSink.make();

      var orbMenuPart = {
        dom: {
          tag: 'div',
          // styles: { display: 'flex' }
        },
        components: [
          Menu.parts().items()
        ],
        value: 'touch-menu-1',
        markers: {
          item: 'alloy-orb',
          selectedItem: 'alloy-selected-orb'
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
                  styles: {
                    display: 'flex',
                    'justify-content': 'center'
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
        }
      };
     
      
      var button1 = HtmlDisplay.section(
        gui,
        'Run this in touch device mode. It is a button that if you press and hold on it, it opens a circular menu below.',
        {
          dom: {
            tag: 'div'
          },
          components: [
            GuiFactory.premade(sink),

            TouchMenu.sketch({
              dom: {
                tag: 'span',
                innerHtml: 'Menu button (sketch)',
                classes: [ 'tap-menu' ]
              },
              lazySink: function () {
                return Result.value(sink)
              },
              fetch: function () {
                return Future.pure([
                  { type: 'item', data: { value: 'alpha', text: 'Alpha', 'item-class': 'alpha' } },
                  { type: 'item', data: { value: 'beta', text: 'Beta', 'item-class': 'beta' } }
                ]);
              },
              onExecute: function (component, menuComp, item, data) {
                console.log('selected', data.value);
              },


              transition: {
                property: 'transform',
                transitionClass: 'longpress-menu-transitioning'
              },

              toggleClass: 'selected',
              parts: { 
                view: {
                  dom: {
                    tag: 'div'
                  }
                },
                menu: orbMenuPart
              }
            })
          ]
        }
      );
    };
  }
);
