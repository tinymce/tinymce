import { Obj } from '@ephox/katamari';

const hasKey = function (obj, key) {
  return Obj.has(obj, key) && obj[key] !== undefined && obj[key] !== null;
};

export {
  hasKey
};
