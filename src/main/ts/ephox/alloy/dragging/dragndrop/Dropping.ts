import * as EventHandler from '../../construct/EventHandler';
import * as DomModification from '../../dom/DomModification';
import { FieldSchema, FieldProcessorAdt } from '@ephox/boulder';
import * as Fields from '../../data/Fields';
import { createDropEventDetails } from './DropEvent';
import * as DataTransfers from './DataTransfers';
import { DroppingConfig } from './DragnDropTypes';
import { DataTransfer } from '@ephox/dom-globals';
import { NativeSimulatedEvent } from '../../events/SimulatedEvent';

const getDataTransferFromEvent = (simulatedEvent: NativeSimulatedEvent): DataTransfer => {
  const rawEvent: any = simulatedEvent.event().raw();
  return rawEvent.dataTransfer;
};

const setDropEffectOnEvent = (simulatedEvent: NativeSimulatedEvent, dropEffect: string) => {
  DataTransfers.setDropEffect(getDataTransferFromEvent(simulatedEvent), dropEffect);
};

const schema: FieldProcessorAdt[] = [
  FieldSchema.defaultedString('type', 'text/plain'),
  FieldSchema.defaultedStringEnum('dropEffect', 'copy', ['copy', 'move', 'link', 'none']),
  Fields.onHandler('onDrop'),
  Fields.onHandler('onDrag'),
  Fields.onHandler('onDragover'),
  Fields.onHandler('onDragenter'),
  Fields.onHandler('onDragleave'),
  FieldSchema.state('instance', () => {
    // http://www.quirksmode.org/blog/archives/2009/09/the_html5_drag.html
    // For the drop event to fire at all, you have to cancel the defaults of both the dragover and the dragenter event.

    const exhibit = () => DomModification.nu({ });

    const handlers = (config: DroppingConfig) => {
      return {
        // TODO: Make constants in NativeEvents
        dragover: EventHandler.nu({
          // Consider using abort.
          run: (comp, simulatedEvent) => {
            simulatedEvent.stop();
            setDropEffectOnEvent(simulatedEvent, config.dropEffect);
            config.onDragover(comp, simulatedEvent);
          }
        }),

        dragleave: EventHandler.nu({
          run: (comp, simulatedEvent) => {
            config.onDragleave(comp, simulatedEvent);
          }
        }),

        drag: EventHandler.nu({
          run: (comp, simulatedEvent) => {
            config.onDrag(comp, simulatedEvent);
          }
        }),

        dragenter: EventHandler.nu({
          run: (comp, simulatedEvent) => {
            const transfer: DataTransfer = simulatedEvent.event().raw().dataTransfer;
            DataTransfers.setDropEffect(transfer, config.dropEffect);
    
            simulatedEvent.stop();
            setDropEffectOnEvent(simulatedEvent, config.dropEffect);
            config.onDragenter(comp, simulatedEvent);
          }
        }),

        drop: EventHandler.nu({
          run (component, simulatedEvent) {
            setDropEffectOnEvent(simulatedEvent, config.dropEffect);

            if (DataTransfers.isValidDrop(getDataTransferFromEvent(simulatedEvent))) {
              config.onDrop(component, createDropEventDetails(config, simulatedEvent));
            }
          }
        })
      };
    };

    return { exhibit, handlers };
  })
];

export default schema;
