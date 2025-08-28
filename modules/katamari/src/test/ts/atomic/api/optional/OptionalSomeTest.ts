import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';
import fc from 'fast-check';

import * as Fun from 'ephox/katamari/api/Fun';
import { Optional } from 'ephox/katamari/api/Optional';
import * as Optionals from 'ephox/katamari/api/Optionals';
import * as ArbDataTypes from 'ephox/katamari/test/arb/ArbDataTypes';
import { assertNone, assertOptional } from 'ephox/katamari/test/AssertOptional';

describe('atomic.katamari.api.optional.OptionalsSomeTest', () => {
  it('OptionSomeTest', () => {
    const boom = () => {
      throw new Error('Should not be called');
    };

    const s = Optional.some(5);
    assert.equal(s.getOrDie('Died!'), 5);
    assertOptional(s.or(Optional.some(6)), Optional.some(5));
    assertOptional(s.orThunk(boom), Optional.some(5));

    assert.equal(s.map((v) => v * 2).getOrDie(), 10);

    assertOptional(s.bind((v) => Optional.some('test' + v)), Optional.some('test5'));

    assertOptional(Optional.from(5), Optional.some(5));

    assert.deepEqual(Optional.some(1).toArray(), [ 1 ]);
    assert.deepEqual(Optional.some({ cat: 'dog' }).toArray(), [{ cat: 'dog' }]);
    assert.deepEqual(Optional.some([ 1 ]).toArray(), [[ 1 ]]);

    assert.isTrue(Optionals.equals(Optional.some(6).or(Optional.some(7)), Optional.some(6)));
    assert.isTrue(Optionals.equals(Optional.some(3).or(Optional.none()), Optional.some(3)));

    assert.deepEqual(s.fold(boom, (v) => v + 6), 11);
    assert.deepEqual(Optional.some('a').fold(Fun.die('boom'), Fun.identity), 'a');
    assert.deepEqual(Optional.some('z').fold(Fun.die('boom'), (...args: any[]) => {
      return args;
    }), [ 'z' ]);
    assert.deepEqual(Optional.some('a').fold(Fun.die('boom'), (x) => x + 'z'), 'az');
  });

  const arbOptionSome = ArbDataTypes.arbOptionalSome;
  const arbOptionNone = ArbDataTypes.arbOptionalNone;

  it('Checking some(x).fold(die, id) === x', () => {
    fc.assert(fc.property(fc.integer(), (json) => {
      const opt = Optional.some(json);
      const actual = opt.fold(Fun.die('Should not be none!'), Fun.identity);
      assert.deepEqual(actual, json);
    }));
  });

  it('Checking some(x).is(x) === true', () => {
    fc.assert(fc.property(fc.integer(), (json) => {
      const opt = Optional.some(json);
      assert.isTrue(Optionals.is(opt, json));
    }));
  });

  it('Checking some(x).isSome === true', () => {
    fc.assert(fc.property(arbOptionSome(fc.integer()), (opt) => opt.isSome()));
  });

  it('Checking some(x).isNone === false', () => {
    fc.assert(fc.property(arbOptionSome(fc.integer()), (opt) => !opt.isNone()));
  });

  it('Checking some(x).getOr(v) === x', () => {
    fc.assert(fc.property(arbOptionSome(fc.integer()), arbOptionSome(fc.integer()), (a, b) => {
      assert.equal(Optional.some(a).getOr(b), a);
    }));
  });

  it('Checking some(x).getOrThunk(_ -> v) === x', () => {
    fc.assert(fc.property(fc.integer(), fc.func(fc.integer()), (a, thunk) => {
      assert.equal(Optional.some(a).getOrThunk(thunk), a);
    }));
  });

  it('Checking some.getOrDie() never throws', () => {
    fc.assert(fc.property(fc.integer(), fc.string(1, 40), (i, s) => {
      const opt = Optional.some(i);
      opt.getOrDie(s);
    }));
  });

  it('Checking some(x).or(oSomeValue) === some(x)', () => {
    fc.assert(fc.property(fc.integer(), arbOptionSome(fc.integer()), (json, other) => {
      const output = Optional.some(json).or(other);
      assert.isTrue(Optionals.is(output, json));
    }));
  });

  it('Checking some(x).orThunk(_ -> oSomeValue) === some(x)', () => {
    fc.assert(fc.property(fc.integer(), arbOptionSome(fc.integer()), (i, other) => {
      const output = Optional.some(i).orThunk(() => other);
      assert.isTrue(Optionals.is(output, i));
    }));
  });

  it('Checking some(x).map(f) === some(f(x))', () => {
    fc.assert(fc.property(fc.integer(), fc.func(fc.integer()), (a, f) => {
      const opt = Optional.some(a);
      const actual = opt.map(f);
      assert.equal(actual.getOrDie(), f(a));
    }));
  });

  it('Checking some(x).each(f) === undefined and f gets x', () => {
    fc.assert(fc.property(arbOptionSome(fc.integer()), (opt) => {
      let hack: number | null = null;
      const actual = opt.each((x) => {
        hack = x;
      });
      assert.isUndefined(actual);
      assert.equal(opt.getOrDie(), hack);
    }));
  });

  it('Given f :: s -> some(b), checking some(x).bind(f) === some(b)', () => {
    fc.assert(fc.property(fc.integer(), fc.func(arbOptionSome(fc.integer())), (i, f) => {
      const actual = Optional.some(i).bind(f);
      assert.deepEqual(actual, f(i));
    }));
  });

  it('Given f :: s -> none, checking some(x).bind(f) === none', () => {
    fc.assert(fc.property(arbOptionSome(fc.integer()), fc.func(arbOptionNone()), (opt, f) => {
      const actual = opt.bind(f);
      assertNone(actual);
    }));
  });

  it('Checking some(x).exists(_ -> false) === false', () => {
    fc.assert(fc.property(arbOptionSome(fc.integer()), (opt) => !opt.exists(Fun.never)));
  });

  it('Checking some(x).exists(_ -> true) === true', () => {
    fc.assert(fc.property(arbOptionSome(fc.integer()), (opt) => opt.exists(Fun.always)));
  });

  it('Checking some(x).exists(f) iff. f(x)', () => {
    fc.assert(fc.property(fc.integer(), fc.func(fc.boolean()), (i, f) => {
      const opt = Optional.some(i);
      if (f(i)) {
        assert.isTrue(opt.exists(f));
      } else {
        assert.isFalse(opt.exists(f));
      }
    }));
  });

  it('Checking some(x).forall(_ -> false) === false', () => {
    fc.assert(fc.property(arbOptionSome(fc.integer()), (opt) => !opt.forall(Fun.never)));
  });

  it('Checking some(x).forall(_ -> true) === true', () => {
    fc.assert(fc.property(arbOptionSome(fc.integer()), (opt) => opt.forall(Fun.always)));
  });

  it('Checking some(x).forall(f) iff. f(x)', () => {
    fc.assert(fc.property(fc.integer(), fc.func(fc.boolean()), (i, f) => {
      const opt = Optional.some(i);
      if (f(i)) {
        assert.isTrue(opt.forall(f));
      } else {
        assert.isFalse(opt.forall(f));
      }
    }));
  });

  it('Checking some(x).toArray equals [ x ]', () => {
    fc.assert(fc.property(fc.integer(), (json) => {
      assert.deepEqual(Optional.some(json).toArray(), [ json ]);
    }));
  });

  it('Checking some(x).toString equals "some(x)"', () => {
    fc.assert(fc.property(fc.integer(), (json) => {
      assert.equal(Optional.some(json).toString(), 'some(' + json + ')');
    }));
  });
});
