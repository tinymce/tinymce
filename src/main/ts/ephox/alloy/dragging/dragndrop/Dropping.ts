import * as EventHandler from '../../construct/EventHandler';
import * as DomModification from '../../dom/DomModification';
import { FieldSchema, FieldProcessorAdt } from '@ephox/boulder';
import { Fun } from '@ephox/katamari';

import * as DataTransfers from './DataTransfers';
import { AlloyComponent, SugarEvent, SimulatedEvent } from '@ephox/alloy';

interface DroppingInfo {
  type: string;
  onDrop: (component: AlloyComponent, simulatedEvent: SugarEvent) => void;
  onDrag: (component: AlloyComponent, simulatedEvent: SimulatedEvent<any>) => void;
  onDragover: (component: AlloyComponent, simulatedEvent: SimulatedEvent<any>) => void;
  onDragenter: (component: AlloyComponent, simulatedEvent: SimulatedEvent<any>) => void;
  onDragleave: (component: AlloyComponent, simulatedEvent: SimulatedEvent<any>) => void;
  instance: {
    exhibit: () => any;
    handlers: (dragInfo: DroppingInfo) => {
      dragover: any;
      dragleave: any;
      drag: any;
      dragenter: any;
      drop: any;
    };
  };
}

const schema: FieldProcessorAdt[] = [
  FieldSchema.strict('type'),
  FieldSchema.strict('onDrop'),
  // TODO: Use fields handler
  FieldSchema.defaulted('onDrag', Fun.noop),
  FieldSchema.defaulted('onDragover', Fun.noop),
  FieldSchema.defaulted('onDragenter', Fun.noop),
  FieldSchema.defaulted('onDragleave', Fun.noop),
  FieldSchema.state('instance', () => {
    // http://www.quirksmode.org/blog/archives/2009/09/the_html5_drag.html
    // For the drop event to fire at all, you have to cancel the defaults of both the dragover and the dragenter event.

    const exhibit = () => DomModification.nu({ });

    const handlers = (dragInfo: DroppingInfo) => {
      return {
        // TODO: Make constants in NativeEvents
        dragover: EventHandler.nu({
          // Consider using abort.
          run: (comp, simulatedEvent) => {
            dragInfo.onDragover(comp, simulatedEvent);
            simulatedEvent.stop();
          }
        }),

        dragleave: EventHandler.nu({
          run: (comp, simulatedEvent) => {
            dragInfo.onDragleave(comp, simulatedEvent);
          }
        }),

        drag: EventHandler.nu({
          run: (comp, simulatedEvent) => {
            dragInfo.onDrag(comp, simulatedEvent);
          }
        }),

        dragenter: EventHandler.nu({
          run: (comp, simulatedEvent) => {
            dragInfo.onDragenter(comp, simulatedEvent);
            simulatedEvent.stop();
          }
        }),

        drop: EventHandler.nu({
          run (component, simulatedEvent) {
            const transfer = simulatedEvent.event().raw().dataTransfer;
            const data = DataTransfers.getData(transfer, dragInfo.type);
            dragInfo.onDrop(component, simulatedEvent.event());
          }
        })
      };
    };

    return { exhibit, handlers };
  })
];

export default schema;
