define(
  'ephox.alloy.demo.DraggableDemo',

  [
    'ephox.alloy.api.Gui',
    'ephox.alloy.api.behaviour.Dragging',
    'ephox.alloy.api.ui.Button',
    'ephox.alloy.api.ui.Container',
    'ephox.alloy.demo.HtmlDisplay',
    'ephox.alloy.dragging.DragCoord',
    'ephox.boulder.api.Objects',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.sugar.alien.Position',
    'ephox.sugar.api.Class',
    'ephox.sugar.api.Css',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Insert',
    'global!document'
  ],

  function (Gui, Dragging, Button, Container, HtmlDisplay, DragCoord, Objects, Fun, Option, Position, Class, Css, Element, Insert, document) {
    return function () {
      var gui = Gui.create();
      var body = Element.fromDom(document.body);
      Class.add(gui.element(), 'gui-root-demo-container');
      // Css.set(gui.element(), 'direction', 'rtl');

      Insert.append(body, gui.element());
      Css.set(body, 'margin-bottom', '2000px');

      var button1 = HtmlDisplay.section(
        gui,
        'This button is a <code>button</code> that can be dragged',
        Container.build({
          components: [
            Container.build({
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
            Container.build({
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
            Button.build({
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

              behaviours: Objects.wrapAll([
                Dragging.config({
                  mode: 'mouse',
                  blockerClass: [ 'blocker' ],
                  snaps: {
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
                  }
                })
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