define(
  'ephox.alloy.demo.AttachingDemo',

  [
    'ephox.alloy.alien.EventRoot',
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Replacing',
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
    'global!Date',
    'global!document',
    'global!setTimeout'
  ],

  function (
    EventRoot, Behaviour, Replacing, GuiFactory, SystemEvents, Attachment, Gui, Container, EventHandler, HtmlDisplay, Objects, Element, Class, Date, document,
    setTimeout
  ) {
    return function () {
      var gui = Gui.create();
      var body = Element.fromDom(document.body);
      Class.add(gui.element(), 'gui-root-demo-container');
      Attachment.attachSystem(body, gui);

      var list =  HtmlDisplay.section(
        gui,
        'This list will change after three seconds (when the square is added to the page)',
        Container.sketch({
          dom: {
            tag: 'ol' 
          },
          components: [
            {
              dom: {
                tag: 'li',
                innerHtml: 'The square is an in-memory component not connected to the system'
              }
            }
          ],

          containerBehaviours: Behaviour.derive([
            Replacing.config(true)
          ])
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

        events: Objects.wrapAll([
          {
            key: SystemEvents.attachedToDom(),
            value: EventHandler.nu({
              run: function (sq, simulatedEvent) {
                if (EventRoot.isSource(sq, simulatedEvent)) {
                  simulatedEvent.stop();
                  Replacing.append(list, {
                    dom: {
                      tag: 'li',
                      innerHtml: 'The square has been attached to the DOM: ' + new Date().getSeconds()
                    }
                  });
                }
              }
            })
          },
          {
            key: SystemEvents.systemInit(),
            value: EventHandler.nu({
              run: function (sq, simulatedEvent) {
                if (EventRoot.isSource(sq, simulatedEvent)) {
                  simulatedEvent.stop();
                  Replacing.append(list, {
                    dom: {
                      tag: 'li',
                      innerHtml: 'The square has been added to the system: ' + new Date().getSeconds()
                    }
                  })
                }
              }
            })
          }
        ])
      });

      setTimeout(function () {
        list.getSystem().addToWorld(square);
        setTimeout(function () {
          gui.add(square);
        }, 2000);
      }, 2000);

    };
  }
);
