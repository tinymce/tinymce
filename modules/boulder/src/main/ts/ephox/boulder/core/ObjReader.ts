import { Obj } from '@ephox/katamari';

const readOr = function (key, fallback) {
  return function (obj) {
    return Obj.has(obj, key) ? obj[key] : fallback;
  };
};

const hasKey = function (obj, key) {
  return Obj.has(obj, key) && obj[key] !== undefined && obj[key] !== null;
};

export {
  readOr,
  hasKey
};
