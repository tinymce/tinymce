import { Type } from '@ephox/katamari';

import { isInReadWriteMode } from './Mode';

export const normalizeItems = (dataTransfer: DataTransfer, itemsImpl: DataTransferItemList): DataTransferItemList => {
  return {
    ...itemsImpl,

    get length() {
      return itemsImpl.length;
    },

    add: (data: string | File, type?: string) => {
      if (isInReadWriteMode(dataTransfer)) {
        if (Type.isString(data)) {
          if (!Type.isUndefined(type)) {
            itemsImpl.add(data, type);
          }
        } else {
          itemsImpl.add(data);
        }
      }
    },

    remove: (idx: number) => {
      if (isInReadWriteMode(dataTransfer)) {
        itemsImpl.remove(idx);
      }
    },

    clear: () => {
      if (isInReadWriteMode(dataTransfer)) {
        itemsImpl.clear();
      }
    }
  } as unknown as DataTransferItemList;
};
