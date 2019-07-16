import { Resolve } from '@ephox/katamari';

const unsafe = function (name: string, scope?: {}) {
  return Resolve.resolve(name, scope);
};

const getOrDie = function (name: string, scope?: {}) {
  const actual = unsafe(name, scope);

  if (actual === undefined || actual === null) {
    throw new Error(name + ' not available on this browser');
  }
  return actual;
};

export default {
  getOrDie
};
