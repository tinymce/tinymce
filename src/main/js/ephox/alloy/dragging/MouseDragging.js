define(
  'ephox.alloy.dragging.MouseDragging',

  [
    'ephox.alloy.alien.OffsetOrigin',
    'ephox.alloy.api.ui.Container',
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.drag.api.DragApis',
    'ephox.alloy.drag.core.Dragging',
    'ephox.alloy.dragging.common.DragState',
    'ephox.alloy.dragging.DragCoord',
    'ephox.alloy.dragging.mouse.BlockerEvents',
    'ephox.alloy.dragging.mouse.MouseData',
    'ephox.alloy.dragging.Snappables',
    'ephox.boulder.api.FieldSchema',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Option',
    'ephox.sugar.api.properties.Attr',
    'ephox.sugar.api.properties.Css',
    'ephox.sugar.api.search.Traverse',
    'ephox.sugar.api.view.Location',
    'ephox.sugar.api.view.Position',
    'ephox.sugar.api.view.Scroll',
    'global!parseInt',
    'global!window'
  ],

  function (
    OffsetOrigin, Container, EventHandler, DragApis, Dragging, DragState, DragCoord, BlockerEvents,
    MouseData, Snappables, FieldSchema, Fun, Option, Attr, Css, Traverse, Location, Position,
    Scroll, parseInt, window
  ) {
    var defaultLazyViewport = function () {
      var scroll = Scroll.get();

      return {
        x: scroll.left,
        y: scroll.top,
        w: Fun.constant(window.innerWidth),
        h: Fun.constant(window.innerHeight),
        fx: Fun.constant(0),
        fy: Fun.constant(0)
      };
    };

    var handlers = function (dragInfo) {
      var dragApi = {
        drop: function () {
          
        },
        delayDrop: function () {

        },
        forceDrop: function () {

        },
        move: function (simulatedEvent) {
          var event = simulatedEvent.event();
          var delta = dragInfo.state().update(MouseData, event);
          dragBy(delta);
        }
      };

      var blocker = component.getSystem().build(
        Container.sketch({
          dom: {
            styles: {
              left: '0px',
              top: '0px',
              width: '100%',
              height: '100%',
              position: 'fixed',
              opacity: '0.5',
              background: 'rgb(100, 100, 0)',
              'z-index': '1000000000000000'
            },
            classes: [ dragInfo.blockerClass() ],
            events: BlockerEvents.init(dragApi)
          }
        })
      );

      return {
        'mousedown': EventHandler.nu({
          run: function (component, simulatedEvent) {
            if (simulatedEvent.event().raw().button !== 0) return;
            simulatedEvent.stop();

            var dragBy = function (delta) {
              var doc = Traverse.owner(component.element());
              var scroll = Scroll.get(doc);
              
              var target = dragInfo.getTarget()(component.element());
              var origin = OffsetOrigin.getOrigin(target, scroll);
              
              var currentCoord = Css.getRaw(target, 'left').bind(function (left) {
                return Css.getRaw(target, 'top').bind(function (top) {
                  return Css.getRaw(target, 'position').map(function (position) {
                    var nu = position === 'fixed' ? DragCoord.fixed : DragCoord.offset;
                    return nu(
                      parseInt(left, 10), 
                      parseInt(top, 10)
                    );
                  });
                });
              }).getOrThunk(function () {
                var location = Location.absolute(target);
                return DragCoord.absolute(location.left(), location.top());
              });

              var newCoord = dragInfo.snaps().fold(function () {
                // When not docking, use fixed coordinates.
                var translated = DragCoord.translate(currentCoord, delta.left(), delta.top());
                var fixedCoord = DragCoord.asFixed(translated, scroll, origin);
                return DragCoord.fixed(fixedCoord.left(), fixedCoord.top());
              }, function (snapInfo) {
                var snapping = Snappables.moveOrSnap(component, snapInfo, currentCoord, delta, scroll, origin);
                snapping.extra.each(function (extra) {
                  snapInfo.onSensor()(component, extra);
                });
                return snapping.coord;

              });

              var styles = DragCoord.toStyles(newCoord, scroll, origin);
              Css.setAll(target, styles);
            };

            var dragApi = {
              drop: function () {
                
              },
              delayDrop: function () {

              },
              forceDrop: function () {

              },
              move: function (simulatedEvent) {
                var event = simulatedEvent.event();
                var delta = dragInfo.state().update(MouseData, event);
                dragBy(delta);
              }
            };


          }
        })
      };
    };

    var hub = function (component, dragInfo, dragApi, settings) {
      var blocker = component.getSystem().build(
        Container.sketch({
          dom: {
            styles: {
              left: '0px',
              top: '0px',
              width: '100%',
              height: '100%',
              position: 'fixed',
              opacity: '0.5',
              background: 'rgb(100, 100, 0)',
              'z-index': '1000000000000000'
            },
            classes: [ dragInfo.blockerClass() ]
          },
          events: {
            mousedown: EventHandler.nu({
              run: function () {
                dragApi.forceDrop(); //(safety)
              }
            }),
            mouseup: EventHandler.nu({
              run: function () { 
                dragApi.drop();
              }
            }),
            // On mouse move, 
            mousemove: EventHandler.nu({
              run: function (comp, simulatedEvent) {
                dragApi.move(simulatedEvent.event());
                
              }
            }),
            // Missing
            mouseout: EventHandler.nu({
              run: function () {
                // dragApi.delayDrop (give it time to kick back in)
              }
            })
          }
        })
      );

      var start = function () {
        component.getSystem().addToGui(blocker);
        Traverse.parent(blocker.element()).each(function (parent) {
          Css.getRaw(parent, 'z-index').each(function (zindex) {
            Attr.set(parent, 'data-zindex', zindex);
          });
          Css.set(parent, 'z-index', '100000000000');
        });

      };

      var stop = function () {
        Traverse.parent(blocker.element()).each(function (parent) {
          if (Attr.has(parent, 'data-zindex')) Css.set(parent, 'z-index', Attr.get(parent, 'data-zindex'));
          else Css.remove(parent, 'z-index');

          Attr.remove(parent, 'data-zindex');
        });
        component.getSystem().removeFromGui(blocker);
        dragInfo.snaps().each(function (snapInfo) {
          Snappables.stopDrag(component, snapInfo);
        });

        var target = dragInfo.getTarget()(component.element());
        dragInfo.onDrop()(component, target);
      };

      return DragApis.sink({
        element: blocker.element,
        start: start,
        stop: stop,
        destroy: Fun.noop
      });
    };
    
    var instance = function () {
      return {
        handlers: handlers
      };
    };

    var schema = [
      FieldSchema.defaulted('useFixed', false),
      FieldSchema.strict('blockerClass'),
      FieldSchema.defaulted('getTarget', Fun.identity),
      FieldSchema.defaulted('onDrop', Fun.noop),
      FieldSchema.optionObjOf('snaps', [
        FieldSchema.strict('getSnapPoints'),
        FieldSchema.defaulted('onSensor', Fun.noop),
        FieldSchema.strict('leftAttr'),
        FieldSchema.strict('topAttr'),
        FieldSchema.defaulted('lazyViewport', defaultLazyViewport)
      ]),

      FieldSchema.state('state', DragState),
      FieldSchema.state('dragger', instance)
    ];

    return schema;
  }
);