/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Type } from '@ephox/katamari';
import LocalStorage from 'tinymce/core/api/util/LocalStorage';

const storageName = 'tinymce-custom-colors';

export default (max: number = 10) => {
  const storageString = LocalStorage.getItem(storageName);
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

    LocalStorage.setItem(storageName, JSON.stringify(cache));
  };

  const remove = (idx: number): void => {
    cache.splice(idx, 1);
  };

  const state = (): string[] => {
    return cache.slice(0);
  };

  return {
    add,
    state
  };
};
