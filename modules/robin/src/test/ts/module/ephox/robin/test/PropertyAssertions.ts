import * as fc from 'fast-check';

const check = <T>(arbitrary: fc.Arbitrary<T>, f: (value: T) => boolean | void): void => {
  fc.assert(fc.property(arbitrary, f));
};

export {
  check
};
