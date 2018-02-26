import { FieldSchema } from '@ephox/boulder';
import { Fun } from '@ephox/katamari';

import * as AlloyEvents from '../../api/events/AlloyEvents';
import NativeEvents from '../../api/events/NativeEvents';
import * as Fields from '../../data/Fields';
import * as DragMovement from '../common/DragMovement';
import SnapSchema from '../common/SnapSchema';
import * as Snappables from '../snap/Snappables';
import * as TouchData from './TouchData';

const handlers = function (dragConfig, dragState) {

  return AlloyEvents.derive([
    AlloyEvents.stopper(NativeEvents.touchstart()),

    AlloyEvents.run(NativeEvents.touchmove(), function (component, simulatedEvent) {
      simulatedEvent.stop();

      const delta = dragState.update(TouchData, simulatedEvent.event());
      delta.each(function (dlt) {
        DragMovement.dragBy(component, dragConfig, dlt);
      });
    }),

    AlloyEvents.run(NativeEvents.touchend(), function (component, simulatedEvent) {
      dragConfig.snaps().each(function (snapInfo) {
        Snappables.stopDrag(component, snapInfo);
      });
      const target = dragConfig.getTarget()(component.element());
      // INVESTIGATE: Should this be in the MouseDragging?
      dragState.reset();
      dragConfig.onDrop()(component, target);
    })
  ]);
};

const schema = [
  // Is this used?
  FieldSchema.defaulted('useFixed', false),
  FieldSchema.defaulted('getTarget', Fun.identity),
  FieldSchema.defaulted('onDrop', Fun.noop),
  SnapSchema,
  Fields.output('dragger', {
    handlers
  })
];

export default <any> schema;