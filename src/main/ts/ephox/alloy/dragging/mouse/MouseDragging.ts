import DelayedFunction from '../../alien/DelayedFunction';
import AlloyEvents from '../../api/events/AlloyEvents';
import NativeEvents from '../../api/events/NativeEvents';
import Container from '../../api/ui/Container';
import Fields from '../../data/Fields';
import BlockerUtils from '../common/BlockerUtils';
import DragMovement from '../common/DragMovement';
import SnapSchema from '../common/SnapSchema';
import BlockerEvents from './BlockerEvents';
import MouseData from './MouseData';
import Snappables from '../snap/Snappables';
import { FieldSchema } from '@ephox/boulder';
import { Fun } from '@ephox/katamari';

var handlers = function (dragConfig, dragState) {
  return AlloyEvents.derive([
    AlloyEvents.run(NativeEvents.mousedown(), function (component, simulatedEvent) {
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
    })
  ]);
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

export default <any> schema;