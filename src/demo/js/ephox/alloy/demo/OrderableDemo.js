define(
  'ephox.alloy.demo.OrderableDemo',

  [
    'ephox.alloy.api.system.Gui',
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Dragging',
    'ephox.alloy.api.ui.Button',
    'ephox.alloy.api.ui.Container',
    'ephox.alloy.demo.HtmlDisplay',
    'ephox.alloy.dragging.DragCoord',
    'ephox.boulder.api.FieldSchema',
    'ephox.compass.Arr',
    'ephox.perhaps.Option',
    'ephox.sugar.alien.Position',
    'ephox.sugar.api.Class',
    'ephox.sugar.api.Compare',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Insert',
    'ephox.sugar.api.Location',
    'ephox.sugar.api.SelectorFilter',
    'ephox.sugar.api.Width',
    'global!document'
  ],

  function (Gui, Behaviour, Dragging, Button, Container, HtmlDisplay, DragCoord, FieldSchema, Arr, Option, Position, Class, Compare, Element, Insert, Location, SelectorFilter, Width, document) {
    return function () {
      var gui = Gui.create();
      var body = Element.fromDom(document.body);
      Class.add(gui.element(), 'gui-root-demo-container');
      Insert.append(body, gui.element());

      var panel = HtmlDisplay.section(
        gui,
        'This container has orderable buttons',
        Container.sketch({
          components: Arr.map([
            'alpha',
            'beta',
            'gamma',
            'delta',
            'epsilon'
          ], function (c) {
            return Button.sketch({
              dom: {
                tag: 'button',
                innerHtml: c
              },

              behaviours: {
                dragging: {
                  mode: 'mouse',
                  blockerClass: 'demo-blocker',

                  snaps: {
                    getSnapPoints: function (primary) {
                      var buttons = SelectorFilter.descendants(panel.element(), 'button');
                      return Arr.bind(buttons, function (btn) {
                        if (Compare.eq(primary.element(), btn)) return [ ];
                        var loc = Location.absolute(btn);
                        return [
                          Dragging.snap({
                            sensor: DragCoord.offset(loc.left() + Width.get(btn) /2, loc.top()),
                            range: Position(Width.get(btn) / 2, 10),
                            // output: DragCoord.absolute(Option.some(loc.left()), Option.some(loc.top()))

                            // Do not actually change its position, but create a spot there
                            output: DragCoord.absolute(Option.none(), Option.none()),
                            extra: btn
                          })
                        ];
                      });
                    },
                    leftAttr: 'data-drag-left',
                    topAttr: 'data-drag-top',

                    onSensor: function (primary, extra) {
                      // REALLY HACKY but sort of holding together.
                      console.log('extra', extra.dom());
                    }
                  }
                }
              },

              eventOrder: {
                'mousedown': [ 'alloy.base.behaviour', 'dragging' ]
              }
            });
          }),



          behaviours: {
            ordering: {
              blah: 'hi'
            }
          },


          customBehaviours: [
            Behaviour.create(
              [
                FieldSchema.strict('blah')
              ],
              'ordering',
              { },
              { },
              { }
            )
          ]
        })
      );
    };
  }
);