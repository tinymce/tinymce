import { Arr, Type } from '@ephox/katamari';
import LocalStorage from 'tinymce/core/api/util/LocalStorage';

const storageName = 'tinymce-custom-colors';

export default function (max: number = 10) {
  const storageString = LocalStorage.getItem(storageName);
  const localstorage = Type.isString(storageString) ? JSON.parse(storageString) : [];

  const prune = function (list) {
    // When the localStorage cache is too big,
    // remove the difference from the tail (head is fresh, tail is stale!)
    const diff = max - list.length;
    return (diff < 0) ? list.slice(0, max) : list;
  };

  const cache: string[] = prune(localstorage);

  const add = function (key) {
    // Remove duplicates first.
    Arr.indexOf(cache, key).each(remove);

    cache.unshift(key);

    // When max size is exceeded, the oldest colors will be removed
    if (cache.length > max) {
      cache.pop();
    }

    LocalStorage.setItem(storageName, JSON.stringify(cache));
  };

  const remove = function (idx) {
    cache.splice(idx, 1);
  };

  const state = function () {
    return cache.slice(0);
  };

  return {
    add,
    state
  };
}