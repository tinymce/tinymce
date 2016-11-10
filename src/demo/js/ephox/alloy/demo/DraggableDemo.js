define(
  'ephox.alloy.demo.DraggableDemo',

  [
    'ephox.alloy.api.Gui',
    'ephox.alloy.demo.HtmlDisplay',
    'ephox.alloy.dragging.DragCoord',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.sugar.api.Class',
    'ephox.sugar.api.Css',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Insert',
    'global!document'
  ],

  function (Gui, HtmlDisplay, DragCoord, Fun, Option, Class, Css, Element, Insert, document) {
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
        {
          uiType: 'container',
          dom: {
            tag: 'div'
          },
          components: [
            {
              uiType: 'container',
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
            },
            {
              uiType: 'container',
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
            },
            {
              uiType: 'button',
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
              dragging: {
                mode: 'mouse',
                docks: {
                  getDocks: function () {
                    return [
                      // {
                      //   sensor: Fun.constant(
                      //     DragCoord.fixed(300, 10)
                      //   ),
                      //   xRange: Fun.constant(1000),
                      //   yRange: Fun.constant(10),
                      //   output: Fun.constant(
                      //     DragCoord.fixed(Option.none(), Option.some(10))
                      //   )
                      // },

                      {
                        sensor: Fun.constant(
                          DragCoord.offset(300, 500)
                        ),
                        xRange: Fun.constant(40),
                        yRange: Fun.constant(40),
                        output: Fun.constant(
                          DragCoord.absolute(Option.some(300), Option.some(500))
                        )
                      }
                    ];
                  },
                  leftAttr: 'data-drag-left',
                  topAttr: 'data-drag-top'
                }
                // initial position?
              },
              eventOrder: {
                // Because this is a button, allow dragging. It will stop clicking.
                mousedown: [ 'dragging', 'alloy.base.behaviour' ]
              },
              unselecting: true
            }
          ]
        }
      );

    };
  }
);