define(
  'ephox.alloy.dragging.MouseDragging',

  [
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.dragging.Dockables',
    'ephox.alloy.dragging.DragCoord',
    'ephox.alloy.dragging.Presnaps',
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.dragster.api.DragApis',
    'ephox.dragster.core.Dragging',
    'ephox.dragster.detect.Movement',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.sugar.alien.Position',
    'ephox.sugar.api.Css',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Insert',
    'ephox.sugar.api.Location',
    'ephox.sugar.api.Remove',
    'ephox.sugar.api.Scroll',
    'ephox.sugar.api.Traverse',
    'global!parseInt',
    'global!window'
  ],

  function (EventHandler, Dockables, DragCoord, Presnaps, FieldPresence, FieldSchema, ValueSchema, DragApis, Dragging, Movement, Fun, Option, Position, Css, Element, Insert, Location, Remove, Scroll, Traverse, parseInt, window) {
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

    var defaultLazyOrigin = function () {
      return {
        left: Fun.constant(0),
        top: Fun.constant(0)
      };
    };

    var extractCoords = function (event) {
      return Option.some(Position(event.x(), event.y()));
    };

    var compareCoords = function (old, nu) {
      return Position(nu.left() - old.left(), nu.top() - old.top());
    };

    var getOrigin = function (component, scroll) {
      return Traverse.offsetParent(component.element()).orThunk(function () {
        var marker = Element.fromTag('span');
        Insert.before(component.element(), marker);
        var offsetParent = Traverse.offsetParent(marker);
        Remove.remove(marker);
        return offsetParent;
      }).map(function (offsetP) {
        var loc = Location.absolute(offsetP);
        // Think about whether you want to do this.
        return loc.translate(-scroll.left(), -scroll.top());
      }).getOrThunk(function () {
        return Position(0, 0);
      });
    };

    var handlers = function (dragInfo) {
      return {
        'mousedown': EventHandler.nu({
          run: function (component, simulatedEvent) {
            console.log('mouse down');


            var mode = {
              sink: function (dragApi, settings) {
                return hub(component, dragInfo, dragApi, settings);
              },
              extract: extractCoords,
              compare: compareCoords,
              mutate: function (mutation, delta) {
                var doc = Traverse.owner(component.element());
                var scroll = Scroll.get(doc);
                var origin = getOrigin(component, scroll);

                // var attemptSnap = function (component, dockInfo, absLeft, absTop, deltaX, deltaY, scroll, origin)

                var target = dragInfo.getTarget()(component.element());
                
                var currentCoord = Css.getRaw(target, 'left').bind(function (left) {
                  return Css.getRaw(target, 'top').map(function (top) {
                    return DragCoord.offset(
                      parseInt(left, 10), 
                      parseInt(top, 10)
                    );
                  });
                }).getOrThunk(function () {
                  var location = Location.absolute(target);
                  return DragCoord.absolute(location.left(), location.top());
                });

                var newCoord = dragInfo.docks().fold(function () {
                  // When not docking, use fixed coordinates.
                  var translated = DragCoord.translate(currentCoord, delta.left(), delta.top());
                  var fixedCoord = DragCoord.asFixed(translated, scroll, origin);
                  return DragCoord.fixed(fixedCoord.left(), fixedCoord.top());
                }, function (dockInfo) {
                  return Dockables.moveOrDock(component, dockInfo, currentCoord, delta, scroll, origin);
                });

                var styles = DragCoord.toStyles(newCoord, scroll, origin);
                Css.setAll(target, styles);
              }
            };
            var drag = Dragging.setup({ }, mode, { });
            drag.on();
            drag.go();
          }
        })
      };
    };

    var hub = function (component, dragInfo, dragApi, settings) {
      var blocker = component.getSystem().build({
        uiType: 'container',
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
          }
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
          // Missing
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
      });

      

      var start = function () {
        component.getSystem().addToGui(blocker);
      };

      var stop = function () {
        component.getSystem().removeFromGui(blocker);
        dragInfo.docks().each(function (dockInfo) {
          Dockables.stopDrag(component, dockInfo);
        });
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
      FieldSchema.state('movement', Movement),
      FieldSchema.defaulted('getTarget', Fun.identity),
      FieldSchema.field(
        'docks',
        'docks',
        FieldPresence.asOption(),
        ValueSchema.objOf([
          FieldSchema.strict('getDocks'),
          FieldSchema.strict('leftAttr'),
          FieldSchema.strict('topAttr'),
          FieldSchema.defaulted('lazyViewport', defaultLazyViewport)
        ])
      ),
      FieldSchema.state('dragger', instance)
    ];

    return schema;
  }
);