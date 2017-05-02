define(
  'ephox.alloy.dragging.touch.TouchDragging',

  [
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.data.Fields',
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

  function (EventHandler, Fields, DragMovement, DragState, SnapSchema, Snappables, TouchData, FieldSchema, Fun, parseInt, window) {
    var handlers = function (dragConfig, dragState) {
      
      return {
        'touchstart': EventHandler.nu({
          run: function (component, simulatedEvent) {
            simulatedEvent.stop();
          }
        }),
        'touchmove': EventHandler.nu({
          
          run: function (component, simulatedEvent) {
            simulatedEvent.stop();
          
            var delta = dragState.update(TouchData, simulatedEvent.event());
            delta.each(function (dlt) {
              DragMovement.dragBy(component, dragConfig, dlt);
            });
          }
        }),

        'touchend': EventHandler.nu({
          run: function (component, simulatedEvent) {
            dragConfig.snaps().each(function (snapInfo) {
              Snappables.stopDrag(component, snapInfo);
            });
            var target = dragConfig.getTarget()(component.element());
            // INVESTIGATE: Should this be in the MouseDragging?
            dragState.reset();
            dragConfig.onDrop()(component, target);
          }
        })
      };
    };
 
    var schema = [
      // Is this used?
      FieldSchema.defaulted('useFixed', false),
      FieldSchema.defaulted('getTarget', Fun.identity),
      FieldSchema.defaulted('onDrop', Fun.noop),
      SnapSchema,
      Fields.output('dragger', {
        handlers: handlers
      })
    ];

    return schema;
  }
);