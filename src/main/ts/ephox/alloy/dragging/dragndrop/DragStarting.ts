import * as EventHandler from '../../construct/EventHandler';
import * as DomModification from '../../dom/DomModification';
import { FieldSchema, FieldProcessorAdt } from '@ephox/boulder';
import { Arr, Fun, Option } from '@ephox/katamari';
import { Class, Css, Element, Insert, Remove, SelectorFilter, Traverse } from '@ephox/sugar';
import { document } from '@ephox/dom-globals';
import * as DataTransfers from './DataTransfers';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { NativeSimulatedEvent } from '../../events/SimulatedEvent';

export interface DragStartingInfo {
  type: string;
  getData: (component: AlloyComponent) => any;
  getImage: Option<(component: AlloyComponent) => {
    element: () => Element;
    x: () => number;
    y: () => number;
  }>;
  imageParent: Option<Element>;
  canDrag: (component: AlloyComponent, target) => boolean;
  onDragstart: (component: AlloyComponent) => void;
  onDragover: (component: AlloyComponent, simulatedEvent: NativeSimulatedEvent) => void;
  onDragend: (component: AlloyComponent) => void;
  phoneyTypes: string[];
  dropEffect: string;
  instance: {
    exhibit: () => DomModification.DomModification;
    handlers: (dragInfo: DragStartingInfo) => {
      dragover: any;
      dragend: any;
      dragstart: any;
    };
  };
}

const schema: FieldProcessorAdt[] = [
  FieldSchema.strictString('type'),
  FieldSchema.strictFunction('getData'),
  FieldSchema.optionFunction('getImage'),
  FieldSchema.option('imageParent'),
  // Use this to ensure that drag and dropping only happens when within this selector.
  FieldSchema.defaultedFunction('canDrag', Fun.constant(true)),
  FieldSchema.defaultedFunction('onDragstart', Fun.identity),
  FieldSchema.defaultedFunction('onDragover', Fun.identity),
  FieldSchema.defaultedFunction('onDragend', Fun.identity),
  FieldSchema.defaulted('phoneyTypes', []),
  FieldSchema.defaultedStringEnum('dropEffect', 'copy', ['copy', 'move', 'link', 'none']),
  FieldSchema.state('instance', () => {
    const ghost = Element.fromTag('div');

    // Taken from the tech preview. The idea is that it has to be visible, but the ghost's image
    // for the drag effect is repositioned so we just need to put it offscreen.
    Class.add(ghost, 'ghost');
    Css.setAll(ghost, {
      'position': 'absolute',
      'top': '-1000px',
      'max-height': '1000px',
      'max-width': '400px',
      'overflow-y': 'hidden'
    });
    document.body.appendChild(ghost.dom());

    const exhibit = () => {
      return DomModification.nu({
        attributes: {
          draggable: 'true'
        }
      });
    };

    // Inspired by the ideas here. On mousedown, spawn an iamge at pageX, pageY
    // Fire dragDrop on that image
    // remove the image in a setTimeout( 0 )
    // http://jsfiddle.net/stevendwood/akScu/21/

    const handlers = (dragInfo: DragStartingInfo) => {
      return {
        dragover: EventHandler.nu({
          run: dragInfo.onDragover
        }),
        dragend: EventHandler.nu({
          run: dragInfo.onDragend
        }),
        dragstart: EventHandler.nu({
          run: (component, simulatedEvent) => {
            const target = simulatedEvent.event().target();

            if (dragInfo.canDrag(component, target)) {
              const transfer = simulatedEvent.event().raw().dataTransfer;
              const types = [dragInfo.type].concat(dragInfo.phoneyTypes);
              const data = dragInfo.getData(component);

              DataTransfers.setData(transfer, types, data);
              dragInfo.getImage.each((f) => {
                const parent = dragInfo.imageParent.getOrThunk(function () {
                  const doc = Traverse.owner(component.element());
                  return Element.fromDom(doc.dom().body);
                });

                const image = f(component);

                // TODO: Pretty hacky. Why does it keep recreating them?
                const ghosts = SelectorFilter.descendants(parent, '.ghost');
                Arr.each(ghosts, Remove.remove);

                Remove.empty(ghost);
                Insert.append(ghost, image.element());
                Insert.append(parent, ghost);
                DataTransfers.setDragImage(transfer, ghost.dom(), image.x(), image.y());
              });
              DataTransfers.setDropEffect(transfer, dragInfo.dropEffect);

              dragInfo.onDragstart(component);
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