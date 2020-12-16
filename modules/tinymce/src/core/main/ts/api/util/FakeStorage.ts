/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

// Simple stub of localstorage for IE11 with strict security settings #TINY-1782
export const create = () => (() => {
  let data = {};
  let keys = [];
  const storage = {
    getItem: (key) => {
      const item = data[key];
      return item ? item : null;
    },
    setItem: (key, value) => {
      keys.push(key);
      data[key] = String(value);
    },
    key: (index) => {
      return keys[index];
    },
    removeItem: (key) => {
      keys = keys.filter((k) => k === key);
      delete data[key];
    },
    clear: () => {
      keys = [];
      data = {};
    },
    length: 0
  };

  Object.defineProperty(storage, 'length', {
    get: () => keys.length,
    configurable: false,
    enumerable: false
  });

  return storage;
})();
