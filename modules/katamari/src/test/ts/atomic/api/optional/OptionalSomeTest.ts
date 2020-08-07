import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Testable } from '@ephox/dispute';
import fc from 'fast-check';
import * as Fun from 'ephox/katamari/api/Fun';
import { Optional } from 'ephox/katamari/api/Optional';
import { tOptional } from 'ephox/katamari/api/OptionalInstances';
import * as ArbDataTypes from 'ephox/katamari/test/arb/ArbDataTypes';

const { tNumber, tString } = Testable;

UnitTest.test('OptionSomeTest', () => {
  const boom = () => {
    throw new Error('Should not be called');
  };

  const s = Optional.some(5);
  Assert.eq('getOrDie', 5, s.getOrDie('Died!'));
  Assert.eq('or', Optional.some(5), s.or(Optional.some(6)), tOptional(tNumber));
  Assert.eq('orThunk', Optional.some(5), s.orThunk(boom), tOptional(tNumber));

  Assert.eq('map', 10, s.map((v) => v * 2).getOrDie());

  Assert.eq('bind', Optional.some('test5'), s.bind((v) => Optional.some('test' + v)), tOptional(tString));

  Assert.eq('from', Optional.some(5), Optional.from(5), tOptional(tNumber));

  Assert.eq('toArray 1', [ 1 ], Optional.some(1).toArray());
  Assert.eq('toArray 2', [{ cat: 'dog' }], Optional.some({ cat: 'dog' }).toArray());
  Assert.eq('toArray 3', [[ 1 ]], Optional.some([ 1 ]).toArray());

  Assert.eq('or some', true, Optional.some(6).or(Optional.some(7)).equals(Optional.some(6)));
  Assert.eq('or none', true, Optional.some(3).or(Optional.none()).equals(Optional.some(3)));

  Assert.eq('fold 1', 11, s.fold(boom, (v) => v + 6));
  Assert.eq('fold 2', 'a', Optional.some('a').fold(Fun.die('boom'), Fun.identity));
  Assert.eq('fold 3', [ 'z' ], Optional.some('z').fold(Fun.die('boom'), function () {
    return Array.prototype.slice.call(arguments);
  }));
  Assert.eq('fold 4', 'az', Optional.some('a').fold(Fun.die('boom'), (x) => x + 'z'));
});

const arbOptionSome = ArbDataTypes.arbOptionalSome;
const arbOptionNone = ArbDataTypes.arbOptionalNone;

UnitTest.test('Checking some(x).fold(die, id) === x', () => {
  fc.assert(fc.property(fc.integer(), (json) => {
    const opt = Optional.some(json);
    const actual = opt.fold(Fun.die('Should not be none!'), Fun.identity);
    Assert.eq('eq', json, actual);
  }));
});

UnitTest.test('Checking some(x).is(x) === true', () => {
  fc.assert(fc.property(fc.integer(), (json) => {
    const opt = Optional.some(json);
    Assert.eq('eq', true, opt.is(json));
  }));
});

UnitTest.test('Checking some(x).isSome === true', () => {
  fc.assert(fc.property(arbOptionSome(fc.integer()), (opt) => opt.isSome()));
});

UnitTest.test('Checking some(x).isNone === false', () => {
  fc.assert(fc.property(arbOptionSome(fc.integer()), (opt) => !opt.isNone()));
});

UnitTest.test('Checking some(x).getOr(v) === x', () => {
  fc.assert(fc.property(arbOptionSome(fc.integer()), arbOptionSome(fc.integer()), (a, b) => {
    Assert.eq('eq', a, Optional.some(a).getOr(b));
  }));
});

UnitTest.test('Checking some(x).getOrThunk(_ -> v) === x', () => {
  fc.assert(fc.property(fc.integer(), fc.func(fc.integer()), (a, thunk) => {
    Assert.eq('eq', a, Optional.some(a).getOrThunk(thunk));
  }));
});

UnitTest.test('Checking some.getOrDie() never throws', () => {
  fc.assert(fc.property(fc.integer(), fc.string(1, 40), (i, s) => {
    const opt = Optional.some(i);
    opt.getOrDie(s);
  }));
});

UnitTest.test('Checking some(x).or(oSomeValue) === some(x)', () => {
  fc.assert(fc.property(fc.integer(), arbOptionSome(fc.integer()), (json, other) => {
    const output = Optional.some(json).or(other);
    Assert.eq('eq', true, output.is(json));
  }));
});

UnitTest.test('Checking some(x).orThunk(_ -> oSomeValue) === some(x)', () => {
  fc.assert(fc.property(fc.integer(), arbOptionSome(fc.integer()), (i, other) => {
    const output = Optional.some(i).orThunk(() => other);
    Assert.eq('eq', true, output.is(i));
  }));
});

UnitTest.test('Checking some(x).map(f) === some(f(x))', () => {
  fc.assert(fc.property(fc.integer(), fc.func(fc.integer()), (a, f) => {
    const opt = Optional.some(a);
    const actual = opt.map(f);
    Assert.eq('eq', f(a), actual.getOrDie());
  }));
});

UnitTest.test('Checking some(x).each(f) === undefined and f gets x', () => {
  fc.assert(fc.property(arbOptionSome(fc.integer()), (opt) => {
    let hack: number | null = null;
    const actual = opt.each((x) => {
      hack = x;
    });
    Assert.eq('eq', undefined, actual);
    Assert.eq('hack', hack, opt.getOrDie());
  }));
});

UnitTest.test('Given f :: s -> some(b), checking some(x).bind(f) === some(b)', () => {
  fc.assert(fc.property(fc.integer(), fc.func(arbOptionSome(fc.integer())), (i, f) => {
    const actual = Optional.some(i).bind(f);
    Assert.eq('eq', f(i), actual, tOptional(tNumber));
  }));
});

UnitTest.test('Given f :: s -> none, checking some(x).bind(f) === none', () => {
  fc.assert(fc.property(arbOptionSome(fc.integer()), fc.func(arbOptionNone()), (opt, f) => {
    const actual = opt.bind(f);
    Assert.eq('eq', Optional.none(), actual, tOptional(tNumber));
  }));
});

UnitTest.test('Checking some(x).exists(_ -> false) === false', () => {
  fc.assert(fc.property(arbOptionSome(fc.integer()), (opt) => !opt.exists(Fun.never)));
});

UnitTest.test('Checking some(x).exists(_ -> true) === true', () => {
  fc.assert(fc.property(arbOptionSome(fc.integer()), (opt) => opt.exists(Fun.always)));
});

UnitTest.test('Checking some(x).exists(f) iff. f(x)', () => {
  fc.assert(fc.property(fc.integer(), fc.func(fc.boolean()), (i, f) => {
    const opt = Optional.some(i);
    if (f(i)) {
      Assert.eq('eq', true, opt.exists(f));
    } else {
      Assert.eq('eq', false, opt.exists(f));
    }
  }));
});

UnitTest.test('Checking some(x).forall(_ -> false) === false', () => {
  fc.assert(fc.property(arbOptionSome(fc.integer()), (opt) => !opt.forall(Fun.never)));
});

UnitTest.test('Checking some(x).forall(_ -> true) === true', () => {
  fc.assert(fc.property(arbOptionSome(fc.integer()), (opt) => opt.forall(Fun.always)));
});

UnitTest.test('Checking some(x).forall(f) iff. f(x)', () => {
  fc.assert(fc.property(fc.integer(), fc.func(fc.boolean()), (i, f) => {
    const opt = Optional.some(i);
    if (f(i)) {
      Assert.eq('eq', true, opt.forall(f));
    } else {
      Assert.eq('eq', false, opt.forall(f));
    }
  }));
});

UnitTest.test('Checking some(x).toArray equals [ x ]', () => {
  fc.assert(fc.property(fc.integer(), (json) => {
    Assert.eq('eq', [ json ], Optional.some(json).toArray());
  }));
});

UnitTest.test('Checking some(x).toString equals "some(x)"', () => {
  fc.assert(fc.property(fc.integer(), (json) => {
    Assert.eq('toString', 'some(' + json + ')', Optional.some(json).toString());
  }));
});
