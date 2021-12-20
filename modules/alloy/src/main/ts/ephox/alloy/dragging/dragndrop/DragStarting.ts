import { FieldProcessor, FieldSchema } from '@ephox/boulder';
import { Fun } from '@ephox/katamari';
import { EventArgs, SugarBody, SugarElement, Traverse } from '@ephox/sugar';

import { AlloyComponent } from '../../api/component/ComponentApi';
import * as AlloyEvents from '../../api/events/AlloyEvents';
import * as NativeEvents from '../../api/events/NativeEvents';
import * as DomModification from '../../dom/DomModification';
import * as DataTransfers from './DataTransfers';
import { DragStartingConfig } from './DragnDropTypes';
import { setImageClone } from './ImageClone';

const dragStart = (component: AlloyComponent, target: SugarElement<Node>, config: DragStartingConfig, transfer: DataTransfer) => {
  DataTransfers.setEffectAllowed(transfer, config.effectAllowed);

  config.getData.each((getData) => {
    const data = getData(component);
    const types = [ config.type ].concat(config.phoneyTypes);

    DataTransfers.setData(transfer, types, data);
  });

  config.getImage.each((f) => {
    const image = f(component);
    const parent = config.getImageParent.fold(
      () => Traverse.parentElement(target).getOr(SugarBody.body()),
      (f) => f(component)
    );

    setImageClone(transfer, image, parent);
  });
};

const schema: FieldProcessor[] = [
  FieldSchema.defaultedString('type', 'text/plain'),
  FieldSchema.defaulted('phoneyTypes', []),
  FieldSchema.defaultedStringEnum('effectAllowed', 'all', [ 'copy', 'move', 'link', 'all', 'copyLink', 'linkMove', 'copyMove' ]),
  FieldSchema.optionFunction('getData'),
  FieldSchema.optionFunction('getImageParent'),
  FieldSchema.optionFunction('getImage'),
  // Use this to ensure that drag and dropping only happens when within this selector.
  FieldSchema.defaultedFunction('canDrag', Fun.always),
  FieldSchema.defaultedFunction('onDragstart', Fun.identity),
  FieldSchema.defaultedFunction('onDragover', Fun.identity),
  FieldSchema.defaultedFunction('onDragend', Fun.identity),
  FieldSchema.customField('instance', () => {
    const exhibit = () => DomModification.nu({
      attributes: {
        draggable: 'true'
      }
    });

    const handlers = (config: DragStartingConfig): AlloyEvents.AlloyEventRecord => AlloyEvents.derive([
      AlloyEvents.run(NativeEvents.dragover(), config.onDragover),
      AlloyEvents.run(NativeEvents.dragend(), config.onDragend),
      AlloyEvents.run<EventArgs<DragEvent>>(NativeEvents.dragstart(), (component, simulatedEvent) => {
        const target = simulatedEvent.event.target;
        const transfer: DataTransfer = DataTransfers.getDataTransferFromEvent(simulatedEvent);

        if (config.canDrag(component, target)) {
          dragStart(component, target, config, transfer);
          config.onDragstart(component, simulatedEvent);
        } else {
          simulatedEvent.event.prevent();
        }
      })
    ]);

    return {
      exhibit,
      handlers
    };
  })
];

export default schema;
