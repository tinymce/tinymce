define(
  'ephox.alloy.dragging.mouse.MouseDragging',

  [
    'ephox.alloy.alien.DelayedFunction',
    'ephox.alloy.api.ui.Container',
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.data.Fields',
    'ephox.alloy.dragging.common.BlockerUtils',
    'ephox.alloy.dragging.common.DragMovement',
    'ephox.alloy.dragging.common.DragState',
    'ephox.alloy.dragging.common.SnapSchema',
    'ephox.alloy.dragging.mouse.BlockerEvents',
    'ephox.alloy.dragging.mouse.MouseData',
    'ephox.alloy.dragging.snap.Snappables',
    'ephox.boulder.api.FieldSchema',
    'ephox.katamari.api.Fun',
    'global!parseInt',
    'global!window'
  ],

  function (
    DelayedFunction, Container, EventHandler, Fields, BlockerUtils, DragMovement, DragState, SnapSchema, BlockerEvents, MouseData, Snappables, FieldSchema, Fun,
    parseInt, window
  ) {
    var handlers = function (dragConfig, dragState) {
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
                delayDrop.schedule();
              },
              forceDrop: function () {
                stop();
              },
              move: function (event) {
                // Stop any pending drops caused by mouseout
                delayDrop.cancel();
                var delta = dragState.update(MouseData, event);
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
                  classes: [ dragConfig.blockerClass() ]
                },
                events: BlockerEvents.init(dragApi)
              })
            );

            var dragBy = function (delta) {
              DragMovement.dragBy(component, dragConfig, delta);
            };

            var stop = function () {
              BlockerUtils.discard(blocker);
              dragConfig.snaps().each(function (snapInfo) {
                Snappables.stopDrag(component, snapInfo);
              });
              var target = dragConfig.getTarget()(component.element());
              dragConfig.onDrop()(component, target);
            };

            // If the user has moved something outside the area, and has not come back within
            // 200 ms, then drop
            var delayDrop = DelayedFunction(stop, 200);
            
            var start = function () {
              BlockerUtils.instigate(component, blocker);
            };

            start();
          }
        })
      };
    };

    var schema = [
      // TODO: Is this used?
      FieldSchema.defaulted('useFixed', false),
      FieldSchema.strict('blockerClass'),
      FieldSchema.defaulted('getTarget', Fun.identity),
      Fields.onHandler('onDrop'),
      SnapSchema,
      Fields.output('dragger', {
        handlers: handlers
      })
    ];

    return schema;
  }
);