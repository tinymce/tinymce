import { DataTransfer, Element as DomElement } from '@ephox/dom-globals';
import { Arr, Id, Option, Type } from '@ephox/katamari';
import { createFileList } from '../file/FileList';
import { getData } from './DataTransferItem';
import { createDataTransferItemList } from './DataTransferItemList';
import { isInProtectedMode, isInReadWriteMode, setReadWriteMode } from './Mode';

const imageId = Id.generate('image');

const validDropEffects = [ 'none', 'copy', 'link', 'move' ];
const validEffectAlloweds = [ 'none', 'copy', 'copyLink', 'copyMove', 'link', 'linkMove', 'move', 'all', 'uninitialized' ];

export interface DragImageData {
  image: DomElement;
  x: number;
  y: number;
}

const setDragImage = (transfer: DataTransfer, imageData: DragImageData) => {
  const dt: any = transfer;
  dt[imageId] = imageData;
};

const getDragImage = (transfer: DataTransfer): Option<DragImageData> => {
  const dt: any = transfer;
  return Option.from(dt[imageId]);
};

const normalize = (format: string) => {
  const lcFormat = format.toLowerCase();

  if (lcFormat === 'text') {
    return 'text/plain';
  } else if (lcFormat === 'url') {
    return 'text/uri-list';
  } else {
    return lcFormat;
  }
};

const createDataTransfer = (): DataTransfer => {
  let dropEffect = 'move';
  let effectAllowed = 'all';

  const dataTransfer: DataTransfer = {
    get dropEffect() {
      return dropEffect;
    },

    set dropEffect(effect: string) {
      if (Arr.contains(validDropEffects, effect)) {
        dropEffect = effect;
      }
    },

    get effectAllowed() {
      return effectAllowed;
    },

    set effectAllowed(allowed: string) {
      if (Arr.contains(validEffectAlloweds, allowed)) {
        effectAllowed = allowed;
      }
    },

    get items() {
      return items;
    },

    get files() {
      if (isInProtectedMode(dataTransfer)) {
        return createFileList([]);
      }

      const files = Arr.bind(Arr.from(items), (item) => item.kind === 'file' ? [ item.getAsFile() ] : []);

      return createFileList(files);
    },

    get types() {
      const types = Arr.map(Arr.from(items), (item) => item.type);
      const hasFiles = Arr.exists(Arr.from(items), (item) => item.kind === 'file');
      return types.concat(hasFiles ? [ 'Files' ] : []);
    },

    setDragImage: (image: DomElement, x: number, y: number) => {
      if (isInReadWriteMode(dataTransfer)) {
        setDragImage(dataTransfer, { image, x, y });
      }
    },

    getData: (format: string) => {
      if (isInProtectedMode(dataTransfer)) {
        return '';
      }

      return Arr.find(Arr.from(items), (item) => item.type === normalize(format)).bind((item) => getData(item)).getOr('');
    },

    setData: (format: string, data: string) => {
      if (isInReadWriteMode(dataTransfer)) {
        dataTransfer.clearData(normalize(format));
        items.add(data, normalize(format));
      }

      return true; // Standard says void dom-globals says boolean
    },

    clearData: (format?: string) => {
      if (isInReadWriteMode(dataTransfer)) {
        const normalizedFormat = normalize(format);

        if (Type.isString(normalizedFormat)) {
          Arr.findIndex(Arr.from(items), (item) => item.type === normalizedFormat).each((idx) => {
            items.remove(idx);
          });
        } else {
          for (let i = items.length; i >= 0; i--) {
            if (items[i].kind === 'string') {
              items.remove(i);
            }
          }
        }
      }

      return true; // Standard says void dom-globals says boolean
    }
  };

  const items = createDataTransferItemList(dataTransfer);

  setReadWriteMode(dataTransfer);

  return dataTransfer;
};

export {
  createDataTransfer,
  getDragImage
};
