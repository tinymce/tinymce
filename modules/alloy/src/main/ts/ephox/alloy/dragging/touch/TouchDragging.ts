import { FieldSchema } from '@ephox/boulder';
import { Fun } from '@ephox/katamari';

import * as Boxes from '../../alien/Boxes';
import { SugarPosition, SugarEvent } from '../../alien/TypeDefinitions';
import { AlloyComponent } from '../../api/component/ComponentApi';
import * as AlloyEvents from '../../api/events/AlloyEvents';
import * as NativeEvents from '../../api/events/NativeEvents';
import * as SystemEvents from '../../api/events/SystemEvents';
import * as Fields from '../../data/Fields';
import * as DragMovement from '../common/DragMovement';
import { DraggingState } from '../common/DraggingTypes';
import { calcStartData } from '../common/DragUtils';
import SnapSchema from '../common/SnapSchema';
import * as Snappables from '../snap/Snappables';
import * as TouchData from './TouchData';
import { TouchDraggingConfig } from './TouchDraggingTypes';

const handlers = (dragConfig: TouchDraggingConfig, dragState: DraggingState<SugarPosition>): AlloyEvents.AlloyEventRecord => {
  const updateStartState = (comp: AlloyComponent) => {
    dragState.setStartData(calcStartData(dragConfig, comp));
  };

  return AlloyEvents.derive([
    AlloyEvents.run(SystemEvents.windowScroll(), updateStartState),
    AlloyEvents.run(NativeEvents.touchstart(), (component, simulatedEvent) => {
      updateStartState(component);
      simulatedEvent.stop();
    }),

    AlloyEvents.run<SugarEvent>(NativeEvents.touchmove(), (component, simulatedEvent) => {
      simulatedEvent.stop();

      const delta = dragState.update(TouchData, simulatedEvent.event());
      const dragStartData = dragState.getStartData().getOrThunk(() => calcStartData(dragConfig, component));
      delta.each((dlt) => {
        DragMovement.dragBy(component, dragConfig, dragStartData, dlt);
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
  FieldSchema.defaultedFunction('getBounds', Boxes.win),
  SnapSchema,
  Fields.output('dragger', {
    handlers
  })
];

export default schema;
