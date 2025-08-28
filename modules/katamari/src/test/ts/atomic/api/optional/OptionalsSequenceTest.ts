import { describe, it } from '@ephox/bedrock-client';
import fc from 'fast-check';

import * as Arr from 'ephox/katamari/api/Arr';
import { Optional } from 'ephox/katamari/api/Optional';
import * as Optionals from 'ephox/katamari/api/Optionals';
import { assertNone, assertOptional } from 'ephox/katamari/test/AssertOptional';

describe('atomic.katamari.api.optional.OptionalsSequenceTest', () => {
  it('unit tests', () => {
    assertOptional(Optionals.sequence<number>([]), Optional.some([]));
    assertOptional(Optionals.sequence<number>([ Optional.some(3) ]), Optional.some([ 3 ]));
    assertOptional(Optionals.sequence<number>([ Optional.some(1), Optional.some(2) ]), Optional.some([ 1, 2 ]));

    assertNone(Optionals.sequence<number>([ Optional.some(1), Optional.none() ]));
    assertNone(Optionals.sequence<number>([ Optional.none(), Optional.some(343) ]));
  });

  it('Single some value', () => {
    fc.assert(fc.property(fc.integer(), (n) => {
      assertOptional(Optionals.sequence([ Optional.some(n) ]), Optional.some([ n ]));
    }));
  });

  it('Two some values', () => {
    fc.assert(fc.property(fc.integer(), fc.integer(), (n, m) => {
      assertOptional(Optionals.sequence<number>([ Optional.some(n), Optional.some(m) ]), Optional.some([ n, m ]));
    }));
  });

  it('Array of numbers', () => {
    fc.assert(fc.property(fc.array(fc.integer()), (n) => {
      const someNumbers = Arr.map(n, (x) => Optional.some(x));
      assertOptional(Optionals.sequence<number>(someNumbers), Optional.some(n));
    }));
  });

  it('Some then none', () => {
    fc.assert(fc.property(fc.array(fc.integer()), (n) => {
      const someNumbers = Arr.map(n, (x) => Optional.some(x));
      assertNone(Optionals.sequence<number>([ ...someNumbers, Optional.none<number>() ]));
    }));
  });

  it('None then some', () => {
    fc.assert(fc.property(fc.array(fc.integer()), (n) => {
      const someNumbers = Arr.map(n, (x) => Optional.some(x));
      assertNone(Optionals.sequence<number>([ Optional.none<number>(), ...someNumbers ]));
    }));
  });

  it('all some', () => {
    fc.assert(fc.property(fc.array(fc.integer()), (n) =>
      assertOptional(Optionals.sequence<number>(Arr.map(n, (x) => Optional.some(x))), Optionals.traverse<number, number>(n, (x) => Optional.some(x)))
    ));
  });
});
