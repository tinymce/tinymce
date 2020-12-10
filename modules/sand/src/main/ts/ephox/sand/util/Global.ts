import { Resolve } from '@ephox/katamari';

const unsafe = <T>(name: string, scope?: {}): T | undefined => {
  return Resolve.resolve(name, scope);
};

const getOrDie = <T>(name: string, scope?: {}): T => {
  const actual = unsafe<T>(name, scope);

  if (actual === undefined || actual === null) {
    throw new Error(name + ' not available on this browser');
  }
  return actual;
};

export {
  getOrDie
};
