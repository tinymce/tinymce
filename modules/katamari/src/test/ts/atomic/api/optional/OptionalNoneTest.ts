import { Assert, UnitTest } from '@ephox/bedrock-client';
import fc from 'fast-check';
import * as Fun from 'ephox/katamari/api/Fun';
import { Optional } from 'ephox/katamari/api/Optional';
import { tOptional } from 'ephox/katamari/api/OptionalInstances';

UnitTest.test('Optional.none: unit tests', () => {
  const s = Optional.none<number>();
  Assert.throws('getOrDie dies', () => {
    s.getOrDie('Died!');
  });
  Assert.eq('or', 6, s.or(Optional.some(6)).getOrDie());
  Assert.eq('orThunk', 6, s.orThunk(() => Optional.some(6)).getOrDie());

  Assert.eq('map is none', Optional.none(), s.map((v) => v * 2), tOptional());
  Assert.eq('map bottom is none', Optional.none(), s.map(Fun.die('boom')), tOptional());

  Assert.eq('bind none some is none', Optional.none(), s.bind((v) => Optional.some('test' + v)), tOptional());

  Assert.eq('from null is none', Optional.none(), Optional.from(null), tOptional());
  Assert.eq('from undefined is none', Optional.none(), Optional.from(undefined), tOptional());

  Assert.eq('none or some(7) is some(s)', true, Optional.none().or(Optional.some(7)).equals(Optional.some(7)));
  Assert.eq('none or none is none', true, Optional.none().or(Optional.none()).equals(Optional.none()));

  Assert.eq('none to array is empty array', [], Optional.none().toArray());

  Assert.eq('fold #1', 'zz', Optional.none().fold(() => 'zz', Fun.die('boom')));
  Assert.eq('fold #2', [], Optional.none().fold(function () {
    return Array.prototype.slice.call(arguments);
  }, Fun.die('boom')));

  Assert.eq('fold #3', 'b', Optional.none().fold(Fun.constant('b'), Fun.die('boom')));
  Assert.eq('bind', Optional.none(), Optional.none().bind(Fun.die('boom')), tOptional());
  Assert.eq('each', undefined, Optional.none().each(Fun.die('boom')));

  Assert.eq('forall none is true', true, Optional.none().forall(Fun.die('boom')));
  Assert.eq('exists none is false', false, Optional.none().exists(Fun.die('boom')));

  Assert.eq('toString', 'none()', Optional.none().toString());
});

UnitTest.test('Checking none.fold(_ -> x, die) === x', () => {
  fc.assert(fc.property(fc.integer(), (i) => {
    const actual = Optional.none<string>().fold(Fun.constant(i), Fun.die('Should not die'));
    Assert.eq('eq', i, actual);
  }));
});

UnitTest.test('Checking none.is === false', () => {
  fc.assert(fc.property(fc.integer(), (v) => {
    Assert.eq('none is', false, Optional.none<number>().is(v));
  }));
});

UnitTest.test('Checking none.getOr(v) === v', () => {
  fc.assert(fc.property(fc.integer(), (i) => {
    Assert.eq('eq', i, Optional.none<any>().getOr(i));
  }));
});

UnitTest.test('Checking none.getOrThunk(_ -> v) === v', () => {
  fc.assert(fc.property(fc.func(fc.integer()), (thunk) => {
    Assert.eq('eq', thunk(), Optional.none<number>().getOrThunk(thunk));
  }));
});

UnitTest.test('Checking none.getOrDie() always throws', () => {
  // Require non empty string of msg falsiness gets in the way.
  fc.assert(fc.property(fc.string(1, 40), (s) => {
    Assert.throws('getOrDie', () => {
      Optional.none().getOrDie(s);
    });
  }));
});

UnitTest.test('Checking none.or(oSomeValue) === oSomeValue', () => {
  fc.assert(fc.property(fc.integer(), (i) => {
    const output = Optional.none().or(Optional.some(i));
    Assert.eq('eq', true, output.is(i));
  }));
});

UnitTest.test('Checking none.orThunk(_ -> v) === v', () => {
  fc.assert(fc.property(fc.integer(), (i) => {
    const output = Optional.none().orThunk(() => Optional.some(i));
    Assert.eq('eq', true, output.is(i));
  }));
});
