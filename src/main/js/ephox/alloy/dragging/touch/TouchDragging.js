define(
  'ephox.alloy.dragging.touch.TouchDragging',

  [
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.dragging.common.DragMovement',
    'ephox.alloy.dragging.common.DragState',
    'ephox.alloy.dragging.common.SnapSchema',
    'ephox.alloy.dragging.snap.Snappables',
    'ephox.alloy.dragging.touch.TouchData',
    'ephox.boulder.api.FieldSchema',
    'ephox.katamari.api.Fun',
    'global!parseInt',
    'global!window'
  ],

  function (EventHandler, DragMovement, DragState, SnapSchema, Snappables, TouchData, FieldSchema, Fun, parseInt, window) {
    

    var handlers = function (dragInfo) {
      
      return {
        'touchstart': EventHandler.nu({
          run: function (component, simulatedEvent) {
            simulatedEvent.stop();
          }
        }),
        'touchmove': EventHandler.nu({
          
          run: function (component, simulatedEvent) {
            simulatedEvent.stop();
          
            var delta = dragInfo.state().update(TouchData, simulatedEvent.event());
            delta.each(function (dlt) {
              DragMovement.dragBy(component, dragInfo, dlt);
            });
          }
        }),

        'touchend': EventHandler.nu({
          run: function (component, simulatedEvent) {
            dragInfo.snaps().each(function (snapInfo) {
              Snappables.stopDrag(component, snapInfo);
            });
            var target = dragInfo.getTarget()(component.element());
            // INVESTIGATE: Should this be in the MouseDragging?
            dragInfo.state().reset();
            dragInfo.onDrop()(component, target);
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
      FieldSchema.defaulted('getTarget', Fun.identity),
      FieldSchema.defaulted('onDrop', Fun.noop),
      SnapSchema,
      FieldSchema.state('state', DragState),
      FieldSchema.state('dragger', instance)
    ];

    return schema;
  }
);