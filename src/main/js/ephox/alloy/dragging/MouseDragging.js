define(
  'ephox.alloy.dragging.MouseDragging',

  [
    'ephox.alloy.construct.EventHandler',
    'ephox.boulder.api.FieldSchema',
    'ephox.dragster.api.DragApis',
    'ephox.dragster.core.Dragging',
    'ephox.dragster.detect.Movement',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.sugar.alien.Position',
    'ephox.sugar.api.Css',
    'ephox.sugar.api.Location',
    'global!parseInt'
  ],

  function (EventHandler, FieldSchema, DragApis, Dragging, Movement, Fun, Option, Position, Css, Location, parseInt) {
    var extractCoords = function (event) {
      return Option.some(Position(event.x(), event.y()));
    };

    var compareCoords = function (old, nu) {
      return Position(nu.left() - old.left(), nu.top() - old.top());
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
              mutate: function (mutation, coords) {
                var target = dragInfo.getTarget()(component.element());
                var location = Location.absolute(target);
                var leftPx = Css.getRaw(target, 'left').getOr(location.left());
                var topPx = Css.getRaw(target, 'top').getOr(location.top());
                Css.setAll(target, {
                  left: (parseInt(leftPx, 10) + coords.left()) + 'px',
                  top: (parseInt(topPx, 10) + coords.top()) + 'px',
                  position: 'absolute'
                });
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
      var mutation = { };
      
      return {
        handlers: handlers
      };
    };

    var schema = [
      FieldSchema.defaulted('useFixed', false),
      FieldSchema.state('movement', Movement),
      FieldSchema.defaulted('getTarget', Fun.identity),
      FieldSchema.state('dragger', instance)
    ];

    return schema;
  }
);