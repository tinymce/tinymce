import { describe, it } from '@ephox/bedrock-client';
import fc from 'fast-check';

import * as Optionals from 'ephox/katamari/api/Optionals';
import { assertNone, assertSome } from 'ephox/katamari/test/AssertOptional';

describe('atomic.katamari.api.optional.OptionalsSomeIfTest', () => {
  it('someIf(false) is none', () => {
    fc.assert(fc.property(fc.integer(), (n) => {
      assertNone(Optionals.someIf<number>(false, n));
    }));
  });

  it('someIf(true) is some', () => {
    fc.assert(fc.property(fc.integer(), (n) => {
      assertSome(Optionals.someIf<number>(true, n), n);
    }));
  });
});
