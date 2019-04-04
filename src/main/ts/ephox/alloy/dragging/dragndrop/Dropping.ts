import * as EventHandler from '../../construct/EventHandler';
import * as DomModification from '../../dom/DomModification';
import { FieldSchema, FieldProcessorAdt } from '@ephox/boulder';
import * as Fields from '../../data/Fields';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { NativeSimulatedEvent } from '../../events/SimulatedEvent';
import { createDropEventDetails, DropEvent } from './DropEvent';

export interface DroppingConfig {
  type: string;
  onDrop: (component: AlloyComponent, simulatedEvent: DropEvent) => void;
  onDrag: (component: AlloyComponent, simulatedEvent: NativeSimulatedEvent) => void;
  onDragover: (component: AlloyComponent, simulatedEvent: NativeSimulatedEvent) => void;
  onDragenter: (component: AlloyComponent, simulatedEvent: NativeSimulatedEvent) => void;
  onDragleave: (component: AlloyComponent, simulatedEvent: NativeSimulatedEvent) => void;
  instance: {
    exhibit: () => any;
    handlers: (dragInfo: DroppingConfig) => {
      dragover: any;
      dragleave: any;
      drag: any;
      dragenter: any;
      drop: any;
    };
  };
}

const schema: FieldProcessorAdt[] = [
  FieldSchema.defaultedString('type', 'text/plain'),
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
            config.onDragover(comp, simulatedEvent);
            simulatedEvent.stop();
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
            config.onDragenter(comp, simulatedEvent);
            simulatedEvent.stop();
          }
        }),

        drop: EventHandler.nu({
          run (component, simulatedEvent) {
            config.onDrop(component, createDropEventDetails(config, simulatedEvent));
          }
        })
      };
    };

    return { exhibit, handlers };
  })
];

export default schema;
