import { Arr } from '@ephox/katamari';

import { getDragImage, setDragImage } from './DragImage';
import { DtEvent, getEventType, isInDragStartEvent, setEventType } from './EventType';
import { getMode, isInProtectedMode, isInReadWriteMode, DtMode, setMode } from './Mode';

type DropEffect = DataTransfer['dropEffect'];
type EffectAllowed = DataTransfer['effectAllowed'];

const validDropEffects: DropEffect[] = [ 'none', 'copy', 'link', 'move' ];
const validEffectAlloweds: EffectAllowed[] = [ 'none', 'copy', 'copyLink', 'copyMove', 'link', 'linkMove', 'move', 'all', 'uninitialized' ];

const createDataTransfer = (): DataTransfer => {
  const dataTransferImpl = new window.DataTransfer();
  let dropEffect: DropEffect = 'move';
  let effectAllowed: EffectAllowed = 'all';

  const dataTransfer: DataTransfer = {
    get dropEffect() {
      return dropEffect;
    },

    set dropEffect(effect: DataTransfer['dropEffect']) {
      if (Arr.contains(validDropEffects, effect)) {
        dropEffect = effect;
      }
    },

    get effectAllowed() {
      return effectAllowed;
    },

    set effectAllowed(allowed: DataTransfer['effectAllowed']) {
      // TINY-9601: Only allow setting effectAllowed to a valid value in a dragstart event
      // https://developer.mozilla.org/en-US/docs/Web/API/DataTransfer/effectAllowed
      if (isInDragStartEvent(dataTransfer) && Arr.contains(validEffectAlloweds, allowed)) {
        effectAllowed = allowed;
      }
    },

    get items() {
      return dataTransferImpl.items;
    },

    get files() {
      return dataTransferImpl.files;
    },

    get types() {
      return dataTransferImpl.types;
    },

    setDragImage: (image: Element, x: number, y: number): void => {
      if (isInReadWriteMode(dataTransfer)) {
        setDragImage(dataTransfer, { image, x, y });
        dataTransferImpl.setDragImage(image, x, y);
      }
    },

    getData: (format: string): string => {
      if (isInProtectedMode(dataTransfer)) {
        return '';
      } else {
        return dataTransferImpl.getData(format);
      }
    },

    setData: (format: string, data: string): void => {
      if (isInReadWriteMode(dataTransfer)) {
        dataTransferImpl.setData(format, data);
      }
    },

    clearData: (format?: string | undefined): void => {
      if (isInReadWriteMode(dataTransfer)) {
        dataTransferImpl.clearData(format);
      }
    }
  };

  setMode(dataTransfer, DtMode.ReadWrite);

  return dataTransfer;
};

const cloneDataTransfer = (original: DataTransfer): DataTransfer => {
  // Create new DataTransfer object to ensure scope is not shared between original and clone
  const clone = createDataTransfer();
  setMode(clone, DtMode.ReadWrite);

  // Store original mode and set to read-only to copy data
  const originalMode = getMode(original);
  setMode(original, DtMode.ReadOnly);

  // Set clone event to dragstart to ensure effectAllowed can be set
  setEventType(clone, DtEvent.Dragstart);

  clone.dropEffect = original.dropEffect;
  clone.effectAllowed = original.effectAllowed;
  getDragImage(original).each((imageData) => clone.setDragImage(imageData.image, imageData.x, imageData.y));

  // Copy string data
  Arr.each(original.types, (type) => {
    if (type !== 'Files') {
      clone.setData(type, original.getData(type));
    }
  });

  // Copy files
  Arr.each(original.files, (file) => clone.items.add(file));

  // Set event type
  getEventType(original).each((type) => {
    setEventType(clone, type);
  });

  // Set mode
  originalMode.each((mode) => {
    setMode(original, mode);
    setMode(clone, mode);
  });

  return clone;
};

export { createDataTransfer, cloneDataTransfer, getDragImage };
