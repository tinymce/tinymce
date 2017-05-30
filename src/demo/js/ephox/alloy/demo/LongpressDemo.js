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
    'ephox.alloy.demo.forms.DemoRenders',
    'ephox.alloy.demo.HtmlDisplay',
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Future',
    'ephox.katamari.api.Result',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.properties.Class',
    'global!console',
    'global!document'
  ],

  function (GuiFactory, Attachment, Gui, Menu, TouchMenu, Debugging, DemoSink, DemoRenders, HtmlDisplay, Arr, Future, Result, Element, Class, console, document) {
    return function () {
      var gui = Gui.create();
      Debugging.registerInspector('gui', gui);

      var body = Element.fromDom(document.body);
      Class.add(gui.element(), 'gui-root-demo-container');
      Attachment.attachSystem(body, gui);

      var sink = DemoSink.make();

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
                return Future.pure(Arr.map([
                  { type: 'item', data: { value: 'alpha', text: 'Alpha' } },
                  { type: 'item', data: { value: 'beta', text: 'Beta'} }
                ], DemoRenders.orb));
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
                menu: {
                  dom: {
                    tag: 'div'
                  },
                  components: [
                    Menu.parts().items({ })
                  ],
                  value: 'touchmenu',
                  markers: DemoRenders.orbMarkers()
                }
              }
            })
          ]
        }
      );
    };
  }
);
