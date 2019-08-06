import { FieldSchema, FieldProcessorAdt } from '@ephox/boulder';
import { DataTransfer } from '@ephox/dom-globals';

import { SugarEvent } from '../../alien/TypeDefinitions';
import * as AlloyEvents from '../../api/events/AlloyEvents';
import * as NativeEvents from '../../api/events/NativeEvents';
import * as DomModification from '../../dom/DomModification';
import * as Fields from '../../data/Fields';
import * as DataTransfers from './DataTransfers';
import { DroppingConfig } from './DragnDropTypes';
import { createDropEventDetails } from './DropEvent';

const schema: FieldProcessorAdt[] = [
  FieldSchema.defaultedString('type', 'text/plain'),
  FieldSchema.defaultedStringEnum('dropEffect', 'move', ['copy', 'move', 'link', 'none']),
  Fields.onHandler('onDrop'),
  Fields.onHandler('onDrag'),
  Fields.onHandler('onDragover'),
  Fields.onHandler('onDragenter'),
  Fields.onHandler('onDragleave'),
  FieldSchema.state('instance', () => {
    const exhibit = () => DomModification.nu({ });

    // http://www.quirksmode.org/blog/archives/2009/09/the_html5_drag.html
    // For the drop event to fire at all, you have to cancel the defaults of both the dragover and the dragenter event.
    const handlers = (config: DroppingConfig): AlloyEvents.AlloyEventRecord => AlloyEvents.derive([
      AlloyEvents.run<SugarEvent>(NativeEvents.dragover(), (comp, simulatedEvent) => {
        simulatedEvent.stop();
        DataTransfers.setDropEffectOnEvent(simulatedEvent, config.dropEffect);
        config.onDragover(comp, simulatedEvent);
      }),

      AlloyEvents.run(NativeEvents.dragleave(), config.onDragleave),
      AlloyEvents.run(NativeEvents.drag(), config.onDrag),

      AlloyEvents.run<SugarEvent>(NativeEvents.dragenter(), (comp, simulatedEvent) => {
        const transfer: DataTransfer = DataTransfers.getDataTransferFromEvent(simulatedEvent);
        DataTransfers.setDropEffect(transfer, config.dropEffect);

        simulatedEvent.stop();
        DataTransfers.setDropEffectOnEvent(simulatedEvent, config.dropEffect);
        config.onDragenter(comp, simulatedEvent);
      }),

      AlloyEvents.run<SugarEvent>(NativeEvents.drop(), (comp, simulatedEvent) => {
        simulatedEvent.stop();
        DataTransfers.setDropEffectOnEvent(simulatedEvent, config.dropEffect);

        if (DataTransfers.isValidDrop(DataTransfers.getDataTransferFromEvent(simulatedEvent))) {
          config.onDrop(comp, createDropEventDetails(config, simulatedEvent));
        }
      })
    ]);

    return { exhibit, handlers };
  })
];

export default schema;
