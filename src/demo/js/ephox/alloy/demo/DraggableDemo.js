define(
  'ephox.alloy.demo.DraggableDemo',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Dragging',
    'ephox.alloy.api.data.DragCoord',
    'ephox.alloy.api.system.Gui',
    'ephox.alloy.api.ui.Button',
    'ephox.alloy.api.ui.Container',
    'ephox.alloy.demo.HtmlDisplay',
    'ephox.boulder.api.Objects',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Option',
    'ephox.sand.api.PlatformDetection',
    'ephox.sugar.api.dom.Insert',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.properties.Class',
    'ephox.sugar.api.properties.Css',
    'ephox.sugar.api.view.Position',
    'global!document'
  ],

  function (Behaviour, Dragging, DragCoord, Gui, Button, Container, HtmlDisplay, Objects, Fun, Option, PlatformDetection, Insert, Element, Class, Css, Position, document) {
    return function () {
      var gui = Gui.create();
      var body = Element.fromDom(document.body);
      Class.add(gui.element(), 'gui-root-demo-container');
      // Css.set(gui.element(), 'direction', 'rtl');

      Insert.append(body, gui.element());
      Css.set(body, 'margin-bottom', '2000px');


      var snapData = {
        getSnapPoints: function () {
          return [
            Dragging.snap({
              sensor: DragCoord.fixed(300, 10),
              range: Position(1000, 30),
              output: DragCoord.fixed(Option.none(), Option.some(10))
            }),

            Dragging.snap({
              sensor: DragCoord.offset(300, 500),
              range: Position(40, 40),
              output: DragCoord.absolute(Option.some(300), Option.some(500))
            })
          ];
        },
        leftAttr: 'data-drag-left',
        topAttr: 'data-drag-top'
      };

      var button1 = HtmlDisplay.section(
        gui,
        'This button is a <code>button</code> that can be dragged',
        Container.sketch({
          components: [
            Container.sketch({
              dom: {
                styles: {
                  position: 'fixed',
                  width: '100px',
                  height: '20px',
                  left: '300px',
                  top: '10px',
                  background: 'blue'
                },
                innerHtml: 'A fixed dock'
              }
            }),
            Container.sketch({
              dom: {
                styles: {
                  position: 'absolute',
                  width: '10px',
                  height: '10px',
                  left: '300px',
                  top: '500px',
                  background: 'red'
                }
              }
            }),
            Button.sketch({
              dom: {
                tag: 'span',
                innerHtml: 'Drag me!',
                styles: {
                  padding: '10px',
                  display: 'inline-block',
                  background: '#333',
                  color: '#fff'
                }
              },

              behaviours: Behaviour.derive([
                Dragging.config(
                  PlatformDetection.detect().deviceType.isTouch() ? {
                    mode: 'touch',
                    snaps: snapData
                  } : {
                    mode: 'mouse',
                    blockerClass: [ 'blocker' ],
                    snaps: snapData
                  }
                )
              ]),
              eventOrder: {
                // Because this is a button, allow dragging. It will stop clicking.
                mousedown: [ 'dragging', 'alloy.base.behaviour' ]
              },
              unselecting: true
            })
          ]
        })
      );

    };
  }
);