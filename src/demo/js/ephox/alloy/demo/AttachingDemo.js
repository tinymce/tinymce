define(
  'ephox.alloy.demo.AttachingDemo',

  [
    'ephox.alloy.alien.EventRoot',
    'ephox.alloy.api.component.GuiFactory',
    'ephox.alloy.api.events.SystemEvents',
    'ephox.alloy.api.system.Attachment',
    'ephox.alloy.api.system.Gui',
    'ephox.alloy.api.ui.Container',
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.demo.HtmlDisplay',
    'ephox.boulder.api.Objects',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.properties.Class',
    'ephox.sugar.api.properties.Html',
    'global!document',
    'global!setTimeout'
  ],

  function (EventRoot, GuiFactory, SystemEvents, Attachment, Gui, Container, EventHandler, HtmlDisplay, Objects, Element, Class, Html, document, setTimeout) {
    return function () {
      var gui = Gui.create();
      var body = Element.fromDom(document.body);
      Class.add(gui.element(), 'gui-root-demo-container');
      Attachment.attachSystem(body, gui);

      var label =  HtmlDisplay.section(
        gui,
        'This label will change after three seconds (when the square is added to the page)',
        Container.sketch({
          dom: {
            tag: 'label',
            innerHtml: 'The square has not yet been added'
          },
          components: [ ]
        })
      );

      var square = GuiFactory.build({
        dom: {
          tag: 'div',
          styles: {
            position: 'absolute',
            width: '20px',
            height: '20px',
            background: 'black'
          }
        },

        behaviours: {
          attaching: { }
        },

        events: Objects.wrap(
          SystemEvents.attachedToDom(),
          EventHandler.nu({
            run: function (sq, simulatedEvent) {
              if (EventRoot.isSource(sq, simulatedEvent)) {
                Html.set(label.element(), 'The square <strong>has now</strong> been added');
              }
            }
          })
        )
      });

      setTimeout(function () {
        gui.add(square);
      }, 3000);
    };
  }
);
