import { Arr, Obj, Type } from '@ephox/katamari';

import { Menu } from 'tinymce/core/api/ui/Ui';
import LocalStorage from 'tinymce/core/api/util/LocalStorage';

export interface ColorCache {
  readonly add: (key: string) => void;
  readonly state: () => string[];
}

interface CacheStorage {
  [index: string]: ColorCache;
}
const cacheStorage: CacheStorage = {};

const ColorCache = (storageId: string, max: number = 10): ColorCache => {
  const storageString = LocalStorage.getItem(storageId);
  const localstorage = Type.isString(storageString) ? JSON.parse(storageString) : [];

  const prune = (list: string[]): string[] => {
    // When the localStorage cache is too big,
    // remove the difference from the tail (head is fresh, tail is stale!)
    const diff = max - list.length;
    return (diff < 0) ? list.slice(0, max) : list;
  };

  const cache = prune(localstorage);

  const add = (key: string): void => {
    // Remove duplicates first.
    Arr.indexOf(cache, key).each(remove);

    cache.unshift(key);

    // When max size is exceeded, the oldest colors will be removed
    if (cache.length > max) {
      cache.pop();
    }

    LocalStorage.setItem(storageId, JSON.stringify(cache));
  };

  const remove = (idx: number): void => {
    cache.splice(idx, 1);
  };

  const state = (): string[] => cache.slice(0);

  return {
    add,
    state
  };
};

const getCacheForId = (id: string): ColorCache =>
  Obj.get(cacheStorage, id).getOrThunk(() => {
    const storageId = `tinymce-custom-colors-${id}`;
    const currentData = LocalStorage.getItem(storageId);

    if (Type.isNullable(currentData)) {
      const legacyDefault = LocalStorage.getItem('tinymce-custom-colors');
      LocalStorage.setItem(storageId, Type.isNonNullable(legacyDefault) ? legacyDefault : '[]');
    }

    const storage = ColorCache(storageId, 10);
    cacheStorage[id] = storage;
    return storage;
  });

const getCurrentColors = (id: string): Menu.ChoiceMenuItemSpec[] =>
  Arr.map(getCacheForId(id).state(), (color) => ({
    type: 'choiceitem',
    text: color,
    icon: 'checkmark',
    value: color
  }));

const addColor = (id: string, color: string): void => {
  getCacheForId(id).add(color);
};

const clearStoredCaches = (): void => {
  Arr.each(Obj.keys(cacheStorage), (key) => delete cacheStorage[key]);
};

export {
  getCurrentColors,
  addColor,
  clearStoredCaches
};
