import { Arr } from '@ephox/katamari';

import { getDragImage, setDragImage } from './DragImage';
import { getEvent, isInDragStartEvent, setDragstartEvent, setEvent } from './Event';
import { createEmptyFileList } from './Files';
import { normalizeItems } from './Items';
import { getMode, isInProtectedMode, isInReadWriteMode, setMode, setReadOnlyMode, setReadWriteMode } from './Mode';

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
      return normalizeItems(dataTransfer, dataTransferImpl.items);
    },

    get files() {
      if (isInProtectedMode(dataTransfer)) {
        return createEmptyFileList();
      } else {
        return dataTransferImpl.files;
      }
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

  setReadWriteMode(dataTransfer);

  return dataTransfer;
};

const cloneDataTransfer = (original: DataTransfer): DataTransfer => {
  // Create new DataTransfer object to ensure scope is not shared between original and clone
  const clone = createDataTransfer();

  const originalMode = getMode(original);
  // Set original to read-only to ensure data can be copied
  setReadOnlyMode(original);

  // Set clone event to dragstart to ensure effectAllowed can be set
  setDragstartEvent(clone);

  clone.dropEffect = original.dropEffect;
  clone.effectAllowed = original.effectAllowed;
  getDragImage(original).each((imageData) => clone.setDragImage(imageData.image, imageData.x, imageData.y));

  Arr.each(original.types, (type) => {
    if (type !== 'Files') {
      clone.setData(type, original.getData(type));
    }
  });

  Arr.each(original.files, (file) => clone.items.add(file));

  getEvent(original).each((type) => {
    setEvent(clone, type);
  });

  originalMode.each((mode) => {
    // Reset original mode since it was set to read-only earlier
    setMode(original, mode);
    setMode(clone, mode);
  });

  return clone;
};

export { createDataTransfer, cloneDataTransfer, getDragImage };
