define(
  'ephox.alloy.demo.OrderableDemo',

  [
    'ephox.alloy.api.Gui',
    'ephox.alloy.api.behaviour.BehaviourExport',
    'ephox.alloy.api.behaviour.Dragging',
    'ephox.alloy.api.ui.Button',
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

  function (Gui, BehaviourExport, Dragging, Button, HtmlDisplay, DragCoord, FieldSchema, Arr, Option, Position, Class, Compare, Element, Insert, Location, SelectorFilter, Width, document) {
    return function () {
      var gui = Gui.create();
      var body = Element.fromDom(document.body);
      Class.add(gui.element(), 'gui-root-demo-container');
      Insert.append(body, gui.element());

      var panel = HtmlDisplay.section(
        gui,
        'This container has orderable buttons',
        {
          uiType: 'container',

          components: Arr.map([
            'alpha',
            'beta',
            'gamma',
            'delta',
            'epsilon'
          ], function (c) {
            return Button.build({
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
                            output: DragCoord.absolute(Option.none(), Option.none())
                          })
                        ];
                      });
                    },
                    leftAttr: 'data-drag-left',
                    topAttr: 'data-drag-top'
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
            BehaviourExport.santa(
              [
                FieldSchema.strict('blah')
              ],
              'ordering',
              { },
              { },
              { }
            )
          ]
        }
      );
    };
  }
);