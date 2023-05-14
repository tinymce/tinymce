import { Type } from '@ephox/katamari';

import { isInReadWriteMode } from './Mode';

export const normalizeItems = (dataTransfer: DataTransfer, itemsImpl: DataTransferItemList): DataTransferItemList =>
  ({
    ...itemsImpl,

    get length() {
      return itemsImpl.length;
    },

    add: (data: string | File, type?: string): DataTransferItem | null => {
      if (isInReadWriteMode(dataTransfer)) {
        if (Type.isString(data)) {
          if (!Type.isUndefined(type)) {
            return itemsImpl.add(data, type);
          }
        } else {
          return itemsImpl.add(data);
        }
      }
      return null;
    },

    remove: (idx: number): void => {
      if (isInReadWriteMode(dataTransfer)) {
        itemsImpl.remove(idx);
      }
    },

    clear: (): void => {
      if (isInReadWriteMode(dataTransfer)) {
        itemsImpl.clear();
      }
    }
  });
