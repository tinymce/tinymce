import type { FieldProcessor } from '@ephox/boulder';
import { Optional } from '@ephox/katamari';
import type { EventArgs } from '@ephox/sugar';

import type { AlloyComponent } from '../../api/component/ComponentApi';
import * as AlloyEvents from '../../api/events/AlloyEvents';
import * as NativeEvents from '../../api/events/NativeEvents';
import * as Fields from '../../data/Fields';
import * as DraggingSchema from '../common/DraggingSchema';
import type { DraggingState } from '../common/DraggingTypes';
import * as DragUtils from '../common/DragUtils';

import * as PointerData from './PointerData';
import type { PointerDraggingConfig } from './PointerDraggingTypes';

const isLeftClick = (e: PointerEvent) => e.button === 0;

const events = <E>(dragConfig: PointerDraggingConfig<E>, dragState: DraggingState, updateStartState: (comp: AlloyComponent) => void): Array<AlloyEvents.AlloyEventKeyAndHandler<EventArgs<PointerEvent>>> => {
  return [
    AlloyEvents.run<EventArgs<PointerEvent>>(NativeEvents.pointerdown(), (component, simulatedEvent) => {
      const raw = simulatedEvent.event.raw;
      if (!isLeftClick(raw)) {
        return;
      }
      simulatedEvent.stop();

      component.element.dom.setPointerCapture(raw.pointerId);
      updateStartState(component);
    }),

    AlloyEvents.run<EventArgs<PointerEvent>>(NativeEvents.pointermove(), (component, simulatedEvent) => {
      dragState.getStartData().each(() => {
        DragUtils.move(component, dragConfig, dragState, PointerData, simulatedEvent.event);
      });
    }),

    AlloyEvents.run<EventArgs<PointerEvent>>(NativeEvents.pointerup(), (component, simulatedEvent) => {
      dragState.getStartData().each(() => {
        const raw = simulatedEvent.event.raw;
        component.element.dom.releasePointerCapture(raw.pointerId);
        DragUtils.stop(component, Optional.none(), dragConfig, dragState);
      });
    }),

    // Safety net — if capture is lost unexpectedly.
    // It sometimes happens that pointer capture is lost without pointerup event being emitted.
    // I could observe that using touchpad in chrome
    AlloyEvents.run<EventArgs<PointerEvent>>(NativeEvents.lostpointercapture(), (component) => {
      dragState.getStartData().each(() => {
        DragUtils.stop(component, Optional.none(), dragConfig, dragState);
      });
    })
  ];
};

const schema: FieldProcessor[] = [
  ...DraggingSchema.schema,
  Fields.output('dragger', {
    handlers: DragUtils.handlers(events)
  })
];

export {
  events,
  schema
};
