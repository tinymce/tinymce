import { type EventArgs, type SugarElement, SugarPosition } from '@ephox/sugar';

import * as AlloyEvents from '../../api/events/AlloyEvents';
import * as NativeEvents from '../../api/events/NativeEvents';
import * as ModernDraggingApis from '../../behaviour/moderndragging/ModernDraggingApis';
import ModernDraggingSchema from '../../behaviour/moderndragging/ModernDraggingSchema';
import type { ModernDraggingBehaviour } from '../../behaviour/moderndragging/ModernDraggingTypes';
import * as ModernDragState from '../../behaviour/moderndragging/ModernDragState';

import * as Behaviour from './Behaviour';

const ModernDragging: ModernDraggingBehaviour = Behaviour.create({
  fields: ModernDraggingSchema,
  name: 'moderndragging',
  apis: ModernDraggingApis,
  state: ModernDragState,
  active: {
    events: (config, state) => {
      return AlloyEvents.derive([
        AlloyEvents.run<EventArgs<PointerEvent>>(NativeEvents.pointerdown(), (component, simulatedEvent) => {
          simulatedEvent.stop();
          const dragElement = simulatedEvent.event.target as unknown as SugarElement<HTMLElement>; // TODO: figure out this cast
          const rawEvent = simulatedEvent.event.raw;
          dragElement.dom.setPointerCapture(rawEvent.pointerId);
          const mousePosition = { x: rawEvent.clientX, y: rawEvent.clientY };
          state.startDragging(dragElement, mousePosition);
          config.onDragStart(component);
        }),
        AlloyEvents.run<EventArgs<PointerEvent>>(NativeEvents.pointerup(), (component, simulatedEvent) => {
          const draggingElement = state.getDraggingElement();
          const rawEvent = simulatedEvent.event.raw;
          if (draggingElement !== null) {
            draggingElement.dom.releasePointerCapture(rawEvent.pointerId);
            state.stopDragging();
            config.onDragStop(component);
          }
        }),
        AlloyEvents.run<EventArgs<Event>>(NativeEvents.lostpointercapture(), (component) => {
          if (state.isDragging()) {
            console.log('lost pointer capture while dragging');
            state.stopDragging();
            config.onDragStop(component);
          }
        }),
        AlloyEvents.run<EventArgs<PointerEvent>>(NativeEvents.pointermove(), (component, simulatedEvent) => {
          const rawEvent = simulatedEvent.event.raw;
          if (state.isDragging()) {
            const mousePosition = { x: rawEvent.clientX, y: rawEvent.clientY };
            const previousMousePosition = state.getPreviousMousePosition();
            const delta = SugarPosition(mousePosition.x - previousMousePosition.x, mousePosition.y - previousMousePosition.y);
            state.updateMousePosition(mousePosition);
            config.onDrag(component, delta);
          }
        }),
      ]);
    }
  },
});

export {
  ModernDragging
};
