import { Arr } from '@ephox/katamari';

import { getDragImage, setDragImage } from './DragImage';
import { getMode, isInProtectedMode, isInReadWriteMode, Mode, setMode } from './Mode';

const createDataTransfer = (): DataTransfer => {
  const dataTransferImpl = new window.DataTransfer();

  const dataTransfer: DataTransfer = {
    get dropEffect() {
      return dataTransferImpl.dropEffect;
    },

    set dropEffect(effect: DataTransfer['dropEffect']) {
      dataTransferImpl.dropEffect = effect;
    },

    get effectAllowed() {
      return dataTransferImpl.effectAllowed;
    },

    set effectAllowed(allowed: DataTransfer['effectAllowed']) {
      dataTransferImpl.effectAllowed = allowed;
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

  setMode(dataTransfer, Mode.ReadWrite);

  return dataTransfer;
};

const cloneDataTransfer = (original: DataTransfer): DataTransfer => {
  // Create new DataTransfer object to ensure scope is not shared between original and clone
  const clone = createDataTransfer();

  // Store original mode and set to read-only to copy data
  const originalMode = getMode(original);
  setMode(original, Mode.ReadOnly);

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

  // Set mode
  originalMode.each((mode) => {
    setMode(original, mode);
    setMode(clone, mode);
  });

  return clone;
};

export { createDataTransfer, cloneDataTransfer, getDragImage };
