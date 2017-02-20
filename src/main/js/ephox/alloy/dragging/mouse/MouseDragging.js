define(
  'ephox.alloy.dragging.mouse.MouseDragging',

  [
    'ephox.alloy.alien.OffsetOrigin',
    'ephox.alloy.api.ui.Container',
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.dragging.common.BlockerUtils',
    'ephox.alloy.dragging.common.DragState',
    'ephox.alloy.api.data.DragCoord',
    'ephox.alloy.dragging.mouse.BlockerEvents',
    'ephox.alloy.dragging.mouse.MouseData',
    'ephox.alloy.dragging.snap.Snappables',
    'ephox.boulder.api.FieldSchema',
    'ephox.katamari.api.Fun',
    'ephox.sugar.api.properties.Css',
    'ephox.sugar.api.search.Traverse',
    'ephox.sugar.api.view.Location',
    'ephox.sugar.api.view.Scroll',
    'global!parseInt',
    'global!window'
  ],

  function (
    OffsetOrigin, Container, EventHandler, BlockerUtils, DragState, DragCoord, BlockerEvents,
    MouseData, Snappables, FieldSchema, Fun, Css, Traverse, Location, Scroll, parseInt,
    window
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
      return {
        'mousedown': EventHandler.nu({
          run: function (component, simulatedEvent) {
            if (simulatedEvent.event().raw().button !== 0) return;
            simulatedEvent.stop();

            var dragApi = {
              drop: function () {
                stop();
              },
              delayDrop: function () {
                stop();
              },
              forceDrop: function () {
                stop();
              },
              move: function (event) {
                // var event = simulatedEvent.event();
                var delta = dragInfo.state().update(MouseData, event);
                delta.each(dragBy);
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
                  classes: [ dragInfo.blockerClass() ]
                },
                events: BlockerEvents.init(dragApi)
              })
            );

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

            var stop = function () {
              BlockerUtils.discard(blocker);
              dragInfo.snaps().each(function (snapInfo) {
                Snappables.stopDrag(component, snapInfo);
              });
              var target = dragInfo.getTarget()(component.element());
              dragInfo.onDrop()(component, target);
            };
            
            var start = function () {
              BlockerUtils.instigate(component, blocker);
            };

            start();
          }
        })
      };
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