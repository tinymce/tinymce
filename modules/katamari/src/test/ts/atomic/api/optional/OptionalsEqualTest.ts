import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';
import fc from 'fast-check';
import * as Fun from 'ephox/katamari/api/Fun';
import { Optional } from 'ephox/katamari/api/Optional';
import { arbOptionalSome as arbOptionSome } from 'ephox/katamari/test/arb/ArbDataTypes';

const boom = Fun.die('boom');

describe('atomic.katamari.api.optional.OptionalsEqualTest', () => {
  it('none === none', () => {
    assert.isTrue(Optional.none().equals(Optional.none()));
  });

  it('Optional.none() !== Optional.some(x)', () => {
    fc.assert(fc.property(fc.integer(), (i) => {
      assert.isFalse(Optional.none().equals(Optional.some(i)));
    }));
  });

  it('Optional.some(x) !== Optional.none()', () => {
    fc.assert(fc.property(fc.integer(), (i) => {
      assert.isFalse((Optional.some(i).equals(Optional.none())));
    }));
  });

  it('Optional.some(x) === Optional.some(x)', () => {
    fc.assert(fc.property(fc.integer(), (i) => assert.isTrue(Optional.some(i).equals(Optional.some(i)))));
  });

  it('Optional.some(x) === Optional.some(x) (same ref)', () => {
    fc.assert(fc.property(fc.integer(), (i) => {
      const ob = Optional.some(i);
      assert.isTrue(ob.equals(ob));
    }));
  });

  it('Optional.some(x) !== Optional.some(x + y) where y is not identity', () => {
    fc.assert(fc.property(fc.string(), fc.string(1, 40), (a, b) => {
      assert.isFalse(Optional.some(a).equals(Optional.some(a + b)));
    }));
  });

  it('unit tests', () => {
    assert.isTrue(Optional.none().equals(Optional.none()));
    assert.isFalse(Optional.none().equals(Optional.some(3)));

    assert.isFalse(Optional.some(4).equals(Optional.none()));
    assert.isFalse(Optional.some(2).equals(Optional.some(4)));
    assert.isTrue(Optional.some(5).equals(Optional.some(5)));
    assert.isFalse(Optional.some(5.1).equals(Optional.some(5.3)));

    const comparator = (a, b) => Math.round(a) === Math.round(b);

    assert.isTrue(Optional.some(5.1).equals_(Optional.some(5.3), comparator));
    assert.isFalse(Optional.some(5.1).equals_(Optional.some(5.9), comparator));
  });

  it('Optionals.equals_', () => {
    assert.isTrue(Optional.none().equals_(Optional.none(), boom));
  });

  it('some !== none, for any predicate', () => {
    fc.assert(fc.property(arbOptionSome(fc.integer()), (opt1) => {
      assert.isFalse(opt1.equals_(Optional.none(), boom));
    }));
  });

  it('none !== some, for any predicate', () => {
    fc.assert(fc.property(arbOptionSome(fc.integer()), (opt1) => {
      assert.isFalse(Optional.none().equals_(opt1, boom));
    }));
  });

  it('Checking some(x).equals_(some(y), _, _ -> false) === false', () => {
    fc.assert(fc.property(arbOptionSome(fc.integer()), arbOptionSome(fc.integer()), (opt1, opt2) => {
      assert.isFalse(opt1.equals_(opt2, Fun.never));
    }));
  });

  it('Checking some(x).equals_(some(y), _, _ -> true) === true', () => {
    fc.assert(fc.property(fc.integer(), fc.integer(), (a, b) => {
      const opt1 = Optional.some(a);
      const opt2 = Optional.some(b);
      assert.isTrue(opt1.equals_(opt2, Fun.always));
    }));
  });

  it('Checking some(x).equals_(some(y), f) iff. f(x, y)', () => {
    fc.assert(fc.property(arbOptionSome(fc.integer()), arbOptionSome(fc.integer()), fc.func(fc.boolean()), (a, b, f) => {
      const opt1 = Optional.some(a);
      const opt2 = Optional.some(b);
      return f(a, b) === opt1.equals_(opt2, f);
    }));
  });
});
