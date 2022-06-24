// Simple stub of localstorage with strict security settings #TINY-1782
export const create = (): Storage => (() => {
  let data: Record<string, string> = {};
  let keys: string[] = [];
  const storage = {
    getItem: (key: string) => {
      const item = data[key];
      return item ? item : null;
    },
    setItem: (key: string, value: string) => {
      keys.push(key);
      data[key] = String(value);
    },
    key: (index: number) => {
      return keys[index];
    },
    removeItem: (key: string) => {
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
