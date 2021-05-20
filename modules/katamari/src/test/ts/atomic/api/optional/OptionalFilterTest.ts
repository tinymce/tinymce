import { describe, it } from '@ephox/bedrock-client';
import fc from 'fast-check';
import * as Fun from 'ephox/katamari/api/Fun';
import { Optional } from 'ephox/katamari/api/Optional';
import { arbOptionalSome as arbOptionSome } from 'ephox/katamari/test/arb/ArbDataTypes';
import { assertNone, assertOptional, assertSome } from 'ephox/katamari/test/AssertOptional';

const { some, none } = Optional;

describe('atomic.katamari.api.optional.OptionalFilterTest', () => {
  it('Optional.filter', () => {
    assertOptional(none<number>().filter(Fun.always), none());
    assertOptional(none<number>().filter(Fun.never), none());
    assertOptional(none<number>().filter(Fun.die('oof')), none());
    assertOptional(none().filter(Fun.die('boom')), none());
    assertOptional(some(5).filter((x) => x === 8), none());
    assertOptional(some(5).filter(Fun.never), none());
    assertOptional(none().filter(Fun.die('boom')), none());
    assertOptional(some(6).filter((x) => x === 6), some(6));
    assertOptional(some(6).filter(Fun.always), some(6));
    assertOptional(some(5).filter(Fun.always), some(5));
    assertOptional(some(5).filter(Fun.never), none());
  });

  it('Checking some(x).filter(_ -> false) === none', () => {
    fc.assert(fc.property(arbOptionSome(fc.integer()), (opt) => {
      assertNone(opt.filter(Fun.never));
    }));
  });

  it('Checking some(x).filter(_ -> true) === some(x)', () => {
    fc.assert(fc.property(fc.integer(), (x) => {
      assertSome(some(x).filter(Fun.always), x);
    }));
  });

  it('Checking some(x).filter(f) === some(x) iff. f(x)', () => {
    fc.assert(fc.property(fc.integer(), fc.func(fc.boolean()), (i, f) => {
      if (f(i)) {
        assertSome(some(i).filter(f), i);
      } else {
        assertNone(some(i).filter(f));
      }
    }));
  });
});
