import * as EventHandler from '../../construct/EventHandler';
import * as DomModification from '../../dom/DomModification';
import { FieldSchema, FieldProcessorAdt } from '@ephox/boulder';
import { Fun } from '@ephox/katamari';
import { Element, Traverse, Body } from '@ephox/sugar';
import { DataTransfer } from '@ephox/dom-globals';
import * as DataTransfers from './DataTransfers';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { setImageClone } from './ImageClone';
import { DragStartingConfig } from './DragnDropTypes';

const dragStart = (component: AlloyComponent, target: Element, config: DragStartingConfig, transfer: DataTransfer) => {
  const data = config.getData(component);
  const types = [config.type].concat(config.phoneyTypes);

  DataTransfers.setEffectAllowed(transfer, config.effectAllowed);
  DataTransfers.setData(transfer, types, data);

  config.getImage.each((f) => {
    const image = f(component);
    const parent = config.getImageParent.fold(
      () => Traverse.parent(target).getOr(Body.body()),
      (f) => f(component)
    );

    setImageClone(transfer, image, parent, target);
  });
};

const schema: FieldProcessorAdt[] = [
  FieldSchema.defaultedString('type', 'text/plain'),
  FieldSchema.defaulted('phoneyTypes', []),
  FieldSchema.defaultedStringEnum('effectAllowed', 'all', ['copy', 'move', 'link', 'all', 'copyLink', 'linkMove', 'copyMove']),
  FieldSchema.defaultedFunction('getData', Fun.constant('')),
  FieldSchema.optionFunction('getImageParent'),
  FieldSchema.optionFunction('getImage'),
  // Use this to ensure that drag and dropping only happens when within this selector.
  FieldSchema.defaultedFunction('canDrag', Fun.constant(true)),
  FieldSchema.defaultedFunction('onDragstart', Fun.identity),
  FieldSchema.defaultedFunction('onDragover', Fun.identity),
  FieldSchema.defaultedFunction('onDragend', Fun.identity),
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