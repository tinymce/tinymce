import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';
import fc from 'fast-check';

import * as Fun from 'ephox/katamari/api/Fun';
import { Optional } from 'ephox/katamari/api/Optional';
import * as Optionals from 'ephox/katamari/api/Optionals';
import { arbOptionalSome as arbOptionSome } from 'ephox/katamari/test/arb/ArbDataTypes';

const boom = Fun.die('boom');

describe('atomic.katamari.api.optional.OptionalsEqualTest', () => {
  it('none === none', () => {
    assert.isTrue(Optionals.equals(Optional.none(), Optional.none()));
  });

  it('Optional.none() !== Optional.some(x)', () => {
    fc.assert(fc.property(fc.integer(), (i) => {
      assert.isFalse(Optionals.equals(Optional.none(), Optional.some(i)));
    }));
  });

  it('Optional.some(x) !== Optional.none()', () => {
    fc.assert(fc.property(fc.integer(), (i) => {
      assert.isFalse((Optionals.equals(Optional.some(i), Optional.none())));
    }));
  });

  it('Optional.some(x) === Optional.some(x)', () => {
    fc.assert(fc.property(fc.integer(), (i) => assert.isTrue(Optionals.equals(Optional.some(i), Optional.some(i)))));
  });

  it('Optional.some(x) === Optional.some(x) (same ref)', () => {
    fc.assert(fc.property(fc.integer(), (i) => {
      const ob = Optional.some(i);
      assert.isTrue(Optionals.equals(ob, ob));
    }));
  });

  it('Optional.some(x) !== Optional.some(x + y) where y is not identity', () => {
    fc.assert(fc.property(fc.string(), fc.string(1, 40), (a, b) => {
      assert.isFalse(Optionals.equals(Optional.some(a), Optional.some(a + b)));
    }));
  });

  it('unit tests', () => {
    assert.isTrue(Optionals.equals(Optional.none(), Optional.none()));
    assert.isFalse(Optionals.equals(Optional.none(), Optional.some(3)));

    assert.isFalse(Optionals.equals(Optional.some(4), Optional.none()));
    assert.isFalse(Optionals.equals(Optional.some(2), Optional.some(4)));
    assert.isTrue(Optionals.equals(Optional.some(5), Optional.some(5)));
    assert.isFalse(Optionals.equals(Optional.some(5.1), Optional.some(5.3)));

    const comparator = (a: number, b: number) => Math.round(a) === Math.round(b);

    assert.isTrue(Optionals.equals(Optional.some(5.1), Optional.some(5.3), comparator));
    assert.isFalse(Optionals.equals(Optional.some(5.1), Optional.some(5.9), comparator));
  });

  it('Optionals.equals with comparator', () => {
    assert.isTrue(Optionals.equals(Optional.none(), Optional.none(), boom));
  });

  it('some !== none, for any predicate', () => {
    fc.assert(fc.property(arbOptionSome(fc.integer()), (opt1) => {
      assert.isFalse(Optionals.equals(opt1, Optional.none(), boom));
    }));
  });

  it('none !== some, for any predicate', () => {
    fc.assert(fc.property(arbOptionSome(fc.integer()), (opt1) => {
      assert.isFalse(Optionals.equals(Optional.none(), opt1, boom));
    }));
  });

  it('Checking Optionals.equals(some(x), some(y), _, _ -> false) === false', () => {
    fc.assert(fc.property(arbOptionSome(fc.integer()), arbOptionSome(fc.integer()), (opt1, opt2) => {
      assert.isFalse(Optionals.equals(opt1, opt2, Fun.never));
    }));
  });

  it('Checking Optionals.equals(some(x), some(y), _, _ -> true) === true', () => {
    fc.assert(fc.property(fc.integer(), fc.integer(), (a, b) => {
      const opt1 = Optional.some(a);
      const opt2 = Optional.some(b);
      assert.isTrue(Optionals.equals(opt1, opt2, Fun.always));
    }));
  });

  it('Checking Optionals.equals(some(x), some(y), f) iff. f(x, y)', () => {
    fc.assert(fc.property(arbOptionSome(fc.integer()), arbOptionSome(fc.integer()), fc.func(fc.boolean()), (a, b, f) => {
      const opt1 = Optional.some(a);
      const opt2 = Optional.some(b);
      return f(a, b) === Optionals.equals(opt1, opt2, f);
    }));
  });
});
