import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';
import fc from 'fast-check';
import { Optional } from 'ephox/katamari/api/Optional';
import * as Optionals from 'ephox/katamari/api/Optionals';

describe('atomic.katamari.api.optional.OptionalsSomeIfTest', () => {
  it('Optionals.someIf: false -> none', () => {
    fc.assert(fc.property(fc.integer(), (n) => {
      assert.deepEqual(Optionals.someIf<number>(false, n), Optional.none());
    }));
  });

  it('Optionals.someIf: true -> some', () => {
    fc.assert(fc.property(fc.integer(), (n) => {
      assert.deepEqual(Optionals.someIf<number>(true, n), Optional.some(n));
    }));
  });
});
