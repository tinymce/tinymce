define(
  'ephox.alloy.dragging.MouseDragging',

  [
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.dragging.Dockables',
    'ephox.alloy.dragging.DragCoord',
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
    'ephox.sugar.api.Location',
    'ephox.sugar.api.Scroll',
    'ephox.sugar.api.Traverse',
    'global!parseInt',
    'global!window'
  ],

  function (EventHandler, Dockables, DragCoord, FieldPresence, FieldSchema, ValueSchema, DragApis, Dragging, Movement, Fun, Option, Position, Css, Location, Scroll, Traverse, parseInt, window) {
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

    var getOrigin = function (component) {
      return Traverse.offsetParent(component.element()).map(Location.absolute).getOrThunk(function () {
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
                var origin = getOrigin(component);
                var scroll = Scroll.get(doc);

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
                  return DragCoord.translate(currentCoord, delta.left(), delta.top());
                }, function (dockInfo) {
                  return Dockables.moveOrDock(component, dockInfo, currentCoord, delta, scroll, origin);
                });

                var styles = DragCoord.toStyles(newCoord, scroll, origin);
                console.log('styles', styles);
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
          FieldSchema.strict('xSensitivity'),
          FieldSchema.strict('ySensitivity'),
          FieldSchema.defaulted('lazyViewport', defaultLazyViewport)
        ])
      ),
      FieldSchema.state('dragger', instance)
    ];

    return schema;
  }
);