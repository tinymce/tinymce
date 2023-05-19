import { Arr, Id, Optional, Type } from '@ephox/katamari';

import { createFileList } from '../file/FileList';
import { getData } from './DataTransferItem';
import { createDataTransferItemList } from './DataTransferItemList';
import { isInProtectedMode, isInReadWriteMode, setReadWriteMode } from './Mode';

type DropEffect = DataTransfer['dropEffect'];
type EffectAllowed = DataTransfer['effectAllowed'];

const imageId = Id.generate('image');

const validDropEffects: DropEffect[] = [ 'none', 'copy', 'link', 'move' ];
const validEffectAlloweds: EffectAllowed[] = [ 'none', 'copy', 'copyLink', 'copyMove', 'link', 'linkMove', 'move', 'all', 'uninitialized' ];

export interface DragImageData {
  image: Element;
  x: number;
  y: number;
}

const setDragImage = (transfer: DataTransfer, imageData: DragImageData) => {
  const dt: any = transfer;
  dt[imageId] = imageData;
};

const getDragImage = (transfer: DataTransfer): Optional<DragImageData> => {
  const dt: any = transfer;
  return Optional.from(dt[imageId]);
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
  let dropEffect: DropEffect = 'move';
  let effectAllowed: EffectAllowed = 'all';

  const dataTransfer: DataTransfer = {
    get dropEffect() {
      return dropEffect;
    },

    set dropEffect(effect: DropEffect) {
      if (Arr.contains(validDropEffects, effect)) {
        dropEffect = effect;
      }
    },

    get effectAllowed() {
      return effectAllowed;
    },

    set effectAllowed(allowed: EffectAllowed) {
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

      const files = Arr.bind(Arr.from(items), (item) => {
        if (item.kind === 'file') {
          const file = item.getAsFile();
          return Type.isNull(file) ? [] : [ file ];
        } else {
          return [];
        }
      });

      return createFileList(files);
    },

    get types() {
      const types = Arr.map(Arr.from(items), (item) => item.type);
      const hasFiles = Arr.exists(Arr.from(items), (item) => item.kind === 'file');
      return types.concat(hasFiles ? [ 'Files' ] : []);
    },

    setDragImage: (image: Element, x: number, y: number) => {
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
    },

    clearData: (format?: string) => {
      if (isInReadWriteMode(dataTransfer)) {
        if (Type.isString(format)) {
          const normalizedFormat = normalize(format);
          Arr.findIndex(Arr.from(items), (item) => item.type === normalizedFormat).each((idx) => {
            items.remove(idx);
          });
        } else {
          for (let i = items.length - 1; i >= 0; i--) {
            if (items[i].kind === 'string') {
              items.remove(i);
            }
          }
        }
      }
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
