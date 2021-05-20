import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';
import fc from 'fast-check';
import { Optional } from 'ephox/katamari/api/Optional';
import * as Optionals from 'ephox/katamari/api/Optionals';
import { assertNone } from 'ephox/katamari/test/AssertOptional';

describe('atomic.katamari.api.optional.OptionalsSomeIfTest', () => {
  it('someIf(false) is none', () => {
    fc.assert(fc.property(fc.integer(), (n) => {
      assertNone(Optionals.someIf<number>(false, n));
    }));
  });

  it('someIf(true) is some', () => {
    fc.assert(fc.property(fc.integer(), (n) => {
      assert.deepEqual(Optionals.someIf<number>(true, n), Optional.some(n));
    }));
  });
});
