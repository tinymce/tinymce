import { FieldSchema, FieldProcessorAdt } from '@ephox/boulder';
import { Fun } from '@ephox/katamari';

import * as AlloyEvents from '../../api/events/AlloyEvents';
import * as NativeEvents from '../../api/events/NativeEvents';
import * as Fields from '../../data/Fields';
import * as DragMovement from '../common/DragMovement';
import SnapSchema from '../common/SnapSchema';
import * as Snappables from '../snap/Snappables';
import * as TouchData from './TouchData';
import { TouchDraggingConfigSpec, TouchDraggingConfig } from '../../dragging/touch/TouchDraggingTypes';
import { DraggingState } from '../../dragging/common/DraggingTypes';
import { SugarPosition, SugarEvent } from '../../alien/TypeDefinitions';

const handlers = (dragConfig: TouchDraggingConfig, dragState: DraggingState<SugarPosition>): AlloyEvents.AlloyEventRecord => {

  return AlloyEvents.derive([
    AlloyEvents.stopper(NativeEvents.touchstart()),

    AlloyEvents.run<SugarEvent>(NativeEvents.touchmove(), (component, simulatedEvent) => {
      simulatedEvent.stop();

      const delta = dragState.update(TouchData, simulatedEvent.event());
      delta.each((dlt) => {
        DragMovement.dragBy(component, dragConfig, dlt);
      });
    }),

    AlloyEvents.run(NativeEvents.touchend(), (component, simulatedEvent) => {
      dragConfig.snaps.each((snapInfo) => {
        Snappables.stopDrag(component, snapInfo);
      });
      const target = dragConfig.getTarget(component.element());
      dragState.reset();
      dragConfig.onDrop(component, target);
    })
  ]);
};

const schema = [
  // Is this used?
  FieldSchema.defaulted('useFixed', false),
  FieldSchema.defaulted('getTarget', Fun.identity),
  FieldSchema.defaulted('onDrag', Fun.noop),
  FieldSchema.defaulted('repositionTarget', true),
  FieldSchema.defaulted('onDrop', Fun.noop),
  SnapSchema,
  Fields.output('dragger', {
    handlers
  })
];

export default schema;