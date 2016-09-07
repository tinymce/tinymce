define(
  'ephox.alloy.demo.PositionDemo',

  [
    'ephox.alloy.api.Gui',
    'ephox.alloy.api.GuiFactory',
    'ephox.alloy.demo.HtmlDisplay',
    'ephox.sugar.api.Class',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Insert'
  ],

  function (Gui, GuiFactory, HtmlDisplay, Class, Element, Insert) {
    return function () {
      var gui = Gui.create();
      var body = Element.fromDom(document.body);
      Class.add(gui.element(), 'gui-root-demo-container');
      Insert.append(body, gui.element());

      var sink = GuiFactory.build({
        uiType: 'custom',
        dom: {
          tag: 'div'
        },
        positioning: {
          useFixed: true
        }
      });

      gui.add(sink);

      var popup = GuiFactory.build({
        uiType: 'custom',
        dom: {
          tag: 'div'
        },
        components: [
          {
            uiType: 'custom',
            dom: {
              tag: 'div',
              styles: {
                'padding': '30px',
                background: 'white',
                border: '2px solid black'
              }
            },
            components: [
              { text: 'This is a popup' }
            ]
          }
        ]
      });

      var section1 = HtmlDisplay.section(
        gui,
        'Position anchoring to button',
        {
          uiType: 'button',
          eventOrder: {
            'alloy.execute': [ 'toggling', 'alloy.base.behaviour' ]
          },
          action: function (comp) {
            console.log('here');
            if (comp.apis().isSelected()) {
              sink.apis().addContainer(popup);
              sink.apis().position({
                anchor: 'hotspot',
                hotspot: comp
              }, popup);
            } else {
              sink.apis().removeContainer(popup);
            }
          },
          text: 'Toggle Popup',
          toggling: {
            toggleClass: 'demo-selected'
          }
        }
      );
    };
  }
);