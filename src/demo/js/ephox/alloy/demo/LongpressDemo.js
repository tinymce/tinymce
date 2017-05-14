define(
  'ephox.alloy.demo.LongpressDemo',

  [
    'ephox.alloy.api.component.GuiFactory',
    'ephox.alloy.api.system.Attachment',
    'ephox.alloy.api.system.Gui',
    'ephox.alloy.api.ui.Menu',
    'ephox.alloy.api.ui.TouchMenu',
    'ephox.alloy.debugging.Debugging',
    'ephox.alloy.demo.DemoSink',
    'ephox.alloy.demo.HtmlDisplay',
    'ephox.katamari.api.Future',
    'ephox.katamari.api.Result',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.properties.Class',
    'global!console',
    'global!document'
  ],

  function (GuiFactory, Attachment, Gui, Menu, TouchMenu, Debugging, DemoSink, HtmlDisplay, Future, Result, Element, Class, console, document) {
    return function () {
      var gui = Gui.create();
      Debugging.registerInspector('gui', gui);

      var body = Element.fromDom(document.body);
      Class.add(gui.element(), 'gui-root-demo-container');
      Attachment.attachSystem(body, gui);

      var sink = DemoSink.make();

      var orbMenuPart = {
        dom: {
          tag: 'div'
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
                return Result.value(sink);
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


              menuTransition: {
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
