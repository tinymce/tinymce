import { Type } from '@ephox/katamari';

const isPrototypeOf = (x: any): x is HTMLElement => {
  return Type.isObject(x) && (/^HTML\w*Element$/.test(x.constructor.name));
};

export {
  isPrototypeOf
};
