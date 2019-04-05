import * as EventHandler from '../../construct/EventHandler';
import * as DomModification from '../../dom/DomModification';
import { FieldSchema, FieldProcessorAdt } from '@ephox/boulder';
import { Fun, Option } from '@ephox/katamari';
import { Element } from '@ephox/sugar';
import { DataTransfer } from '@ephox/dom-globals';
import * as DataTransfers from './DataTransfers';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { NativeSimulatedEvent } from '../../events/SimulatedEvent';
import { setImageClone } from './ImageClone';

export interface DragStartingConfig {
  type: string;
  getData: (component: AlloyComponent) => string;
  getImage: Option<(component: AlloyComponent) => {
    element: () => Element;
    x: () => number;
    y: () => number;
  }>;
  canDrag: (component: AlloyComponent, target: Element) => boolean;
  onDragstart: (component: AlloyComponent, simulatedEvent: NativeSimulatedEvent) => void;
  onDragover: (component: AlloyComponent, simulatedEvent: NativeSimulatedEvent) => void;
  onDragend: (component: AlloyComponent, simulatedEvent: NativeSimulatedEvent) => void;
  phoneyTypes: string[];
  dropEffect: string;
  instance: {
    exhibit: () => DomModification.DomModification;
    handlers: (dragInfo: DragStartingConfig) => {
      dragover: any;
      dragend: any;
      dragstart: any;
    };
  };
}

const dragStart = (component: AlloyComponent, target: Element, config: DragStartingConfig, transfer: DataTransfer) => {
  const data = config.getData(component);
  const types = [config.type].concat(config.phoneyTypes);

  DataTransfers.setData(transfer, types, data);
  DataTransfers.setDropEffect(transfer, config.dropEffect);

  config.getImage.each((f) => {
    const image = f(component);
    setImageClone(transfer, image);
  });
};

const schema: FieldProcessorAdt[] = [
  FieldSchema.defaultedString('type', 'text/plain'),
  FieldSchema.defaultedFunction('getData', Fun.constant('')),
  FieldSchema.optionFunction('getImage'),
  // Use this to ensure that drag and dropping only happens when within this selector.
  FieldSchema.defaultedFunction('canDrag', Fun.constant(true)),
  FieldSchema.defaultedFunction('onDragstart', Fun.identity),
  FieldSchema.defaultedFunction('onDragover', Fun.identity),
  FieldSchema.defaultedFunction('onDragend', Fun.identity),
  FieldSchema.defaulted('phoneyTypes', []),
  FieldSchema.defaultedStringEnum('dropEffect', 'copy', ['copy', 'move', 'link', 'none']),
  FieldSchema.state('instance', () => {
    const exhibit = () => {
      return DomModification.nu({
        attributes: {
          draggable: 'true'
        }
      });
    };

    const handlers = (config: DragStartingConfig) => {
      return {
        dragover: EventHandler.nu({
          run: config.onDragover
        }),
        dragend: EventHandler.nu({
          run: config.onDragend
        }),
        dragstart: EventHandler.nu({
          run: (component, simulatedEvent) => {
            const target = simulatedEvent.event().target();
            const transfer: DataTransfer = simulatedEvent.event().raw().dataTransfer;

            if (config.canDrag(component, target)) {
              dragStart(component, target, config, transfer);
              config.onDragstart(component, simulatedEvent);
            } else {
              simulatedEvent.event().prevent();
            }
          }
        })
      };
    };

    return {
      exhibit,
      handlers
    };
  })
];

export default schema;