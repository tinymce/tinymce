import * as fc from 'fast-check';

const check = <T>(label: string, arbitrary: fc.Arbitrary<T>, f: (value: T) => boolean | void): void => {
  fc.assert(fc.property(arbitrary, f));
};

export {
  check
};
