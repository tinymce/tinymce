import { Arr, Type } from '@ephox/katamari';

import { getDragImage, setDragImage } from './DragImage';

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
      setDragImage(dataTransfer, { image, x, y });
      dataTransferImpl.setDragImage(image, x, y);
    },

    getData: (format: string): string => {
      return dataTransferImpl.getData(format);
    },

    setData: (format: string, data: string): void => {
      dataTransferImpl.setData(format, data);
    },

    clearData: (format?: string | undefined): void => dataTransferImpl.clearData(format),
  };

  return dataTransfer;
};

const cloneDataTransfer = (original: DataTransfer): DataTransfer => {
  // Create new DataTransfer object to ensure scope is not shared between original and clone
  const clone = createDataTransfer();

  clone.dropEffect = original.dropEffect;
  clone.effectAllowed = original.effectAllowed;
  getDragImage(original).each((imageData) => clone.setDragImage(imageData.image, imageData.x, imageData.y));

  // Clone dataTransfer items, indexed by an integer-as-a-string key
  Arr.each(original.items, (item) => {
    if (item.kind === 'string') {
      clone.setData(item.type, original.getData(item.type));
    } else if (item.kind === 'file') {
      const file = item.getAsFile();
      if (!Type.isNull(file)) {
        clone.items.add(file);
      }
    }
  });

  return clone;
};

export { createDataTransfer, cloneDataTransfer, getDragImage };
