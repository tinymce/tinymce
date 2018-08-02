// Simple stub of localstorage for IE11 with strict security settings #TINY-1782
export const create = () => (function () {
  let data = {};
  let keys = [];
  const storage = {
    getItem(key) {
      const item = data[key];
      return item ? item : null;
    },
    setItem(key, value) {
      keys.push(key);
      data[key] = String(value);
    },
    key(index) {
      return keys[index];
    },
    removeItem(key) {
      keys = keys.filter((k) => k === key);
      delete data[key];
    },
    clear() {
      keys = [];
      data = {};
    },
    length: 0
  };

  Object.defineProperty(storage, 'length', {
    get () { return keys.length; },
    configurable: false,
    enumerable: false
  });

  return storage;
})();