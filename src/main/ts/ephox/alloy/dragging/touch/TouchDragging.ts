import AlloyEvents from '../../api/events/AlloyEvents';
import NativeEvents from '../../api/events/NativeEvents';
import Fields from '../../data/Fields';
import DragMovement from '../common/DragMovement';
import SnapSchema from '../common/SnapSchema';
import Snappables from '../snap/Snappables';
import TouchData from './TouchData';
import { FieldSchema } from '@ephox/boulder';
import { Fun } from '@ephox/katamari';

var handlers = function (dragConfig, dragState) {

  return AlloyEvents.derive([
    AlloyEvents.stopper(NativeEvents.touchstart()),

    AlloyEvents.run(NativeEvents.touchmove(), function (component, simulatedEvent) {
      simulatedEvent.stop();

      var delta = dragState.update(TouchData, simulatedEvent.event());
      delta.each(function (dlt) {
        DragMovement.dragBy(component, dragConfig, dlt);
      });
    }),

    AlloyEvents.run(NativeEvents.touchend(), function (component, simulatedEvent) {
      dragConfig.snaps().each(function (snapInfo) {
        Snappables.stopDrag(component, snapInfo);
      });
      var target = dragConfig.getTarget()(component.element());
      // INVESTIGATE: Should this be in the MouseDragging?
      dragState.reset();
      dragConfig.onDrop()(component, target);
    })
  ]);
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

export default <any> schema;