import { Arr, Type } from '@ephox/katamari';
import { File, DataTransferItemList, DataTransferItem, DataTransfer } from '@ephox/dom-globals';
import { createDataTransferItemFromString, createDataTransferItemFromFile } from './DataTransferItem';
import { isInReadWriteMode } from './Mode';

const throwInvalidState = () => {
  throw new Error('Invalid state dataTransfer is not in read/write mode');
};

const createDataTransferItemList = (dataTransfer: DataTransfer): DataTransferItemList => {
  const items: DataTransferItem[] = [];

  const createIndexes = (list: any, items: DataTransferItem[]) => {
    for (let i = 0; i < list.length; i++) {
      delete list[i];
    }

    list.length = items.length;
    Arr.each(items, (item, idx) => {
      list[idx] = item;
    });
  };

  const list = {
    length: 0,

    add: (data: string | File, type?: string) => {
      if (isInReadWriteMode(dataTransfer) === false) {
        throwInvalidState();
      }

      if (Type.isString(data)) {
        const hasType = Arr.exists(items, (item) => item.type === type);

        if (hasType) {
          throw new Error(`Failed to execute 'add' on 'DataTransferItemList': An item already exists for type '${type}'.`);
        }

        items.push(createDataTransferItemFromString(dataTransfer, type, data));
        createIndexes(list, items);
      } else {
        items.push(createDataTransferItemFromFile(dataTransfer, data));
        createIndexes(list, items);
      }
    },

    remove: (idx: number) => {
      if (isInReadWriteMode(dataTransfer) === false) {
        throwInvalidState();
      }

      items.splice(idx, 1);
      createIndexes(list, items);
    },

    clear: () => {
      if (isInReadWriteMode(dataTransfer) === false) {
        throwInvalidState();
      }

      items.splice(0, items.length);
      createIndexes(list, items);
    }
  };

  // Needed to coerce since the add method has overloads
  return list as unknown as DataTransferItemList;
};

export {
  createDataTransferItemList
};
