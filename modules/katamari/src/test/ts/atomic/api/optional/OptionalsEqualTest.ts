import { Assert, UnitTest } from '@ephox/bedrock-client';
import fc from 'fast-check';
import * as Fun from 'ephox/katamari/api/Fun';
import { Optional } from 'ephox/katamari/api/Optional';
import { arbOptionalSome as arbOptionSome } from 'ephox/katamari/test/arb/ArbDataTypes';

const boom = Fun.die('boom');

UnitTest.test('Optionals.equals: none === none', () => {
  Assert.eq('eq', true, Optional.none().equals(Optional.none()));
});

UnitTest.test('Optional.none() !== Optional.some(x)', () => {
  fc.assert(fc.property(fc.integer(), (i) => {
    Assert.eq('eq', false, Optional.none().equals(Optional.some(i)));
  }));
});

UnitTest.test('Optional.some(x) !== Optional.none()', () => {
  fc.assert(fc.property(fc.integer(), (i) => {
    Assert.eq('eq', false, (Optional.some(i).equals(Optional.none())));
  }));
});

UnitTest.test('Optional.some(x) === Optional.some(x)', () => {
  fc.assert(fc.property(fc.integer(), (i) => Assert.eq('eq', true, Optional.some(i).equals(Optional.some(i)))));
});

UnitTest.test('Optional.some(x) === Optional.some(x) (same ref)', () => {
  fc.assert(fc.property(fc.integer(), (i) => {
    const ob = Optional.some(i);
    Assert.eq('eq', true, ob.equals(ob));
  }));
});

UnitTest.test('Optional.some(x) !== Optional.some(x + y) where y is not identity', () => {
  fc.assert(fc.property(fc.string(), fc.string(1, 40), (a, b) => {
    Assert.eq('eq', false, Optional.some(a).equals(Optional.some(a + b)));
  }));
});

UnitTest.test('Optional.some: unit tests', () => {
  Assert.eq('eq', true, Optional.none().equals(Optional.none()));
  Assert.eq('eq', false, Optional.none().equals(Optional.some(3)));

  Assert.eq('eq', false, Optional.some(4).equals(Optional.none()));
  Assert.eq('eq', false, Optional.some(2).equals(Optional.some(4)));
  Assert.eq('eq', true, Optional.some(5).equals(Optional.some(5)));
  Assert.eq('eq', false, Optional.some(5.1).equals(Optional.some(5.3)));

  const comparator = (a, b) => Math.round(a) === Math.round(b);

  Assert.eq('eq', true, Optional.some(5.1).equals_(Optional.some(5.3), comparator));
  Assert.eq('eq', false, Optional.some(5.1).equals_(Optional.some(5.9), comparator));
});

UnitTest.test('Optionals.equals_', () => {
  Assert.eq('eq', true, Optional.none().equals_(Optional.none(), boom));
});

UnitTest.test('some !== none, for any predicate', () => {
  fc.assert(fc.property(arbOptionSome(fc.integer()), (opt1) => {
    Assert.eq('eq', false, opt1.equals_(Optional.none(), boom));
  }));
});

UnitTest.test('none !== some, for any predicate', () => {
  fc.assert(fc.property(arbOptionSome(fc.integer()), (opt1) => {
    Assert.eq('eq', false, Optional.none().equals_(opt1, boom));
  }));
});

UnitTest.test('Checking some(x).equals_(some(y), _, _ -> false) === false', () => {
  fc.assert(fc.property(arbOptionSome(fc.integer()), arbOptionSome(fc.integer()), (opt1, opt2) => {
    Assert.eq('eq', false, opt1.equals_(opt2, Fun.never));
  }));
});

UnitTest.test('Checking some(x).equals_(some(y), _, _ -> true) === true', () => {
  fc.assert(fc.property(fc.integer(), fc.integer(), (a, b) => {
    const opt1 = Optional.some(a);
    const opt2 = Optional.some(b);
    Assert.eq('eq', true, opt1.equals_(opt2, Fun.always));
  }));
});

UnitTest.test('Checking some(x).equals_(some(y), f) iff. f(x, y)', () => {
  fc.assert(fc.property(arbOptionSome(fc.integer()), arbOptionSome(fc.integer()), fc.func(fc.boolean()), (a, b, f) => {
    const opt1 = Optional.some(a);
    const opt2 = Optional.some(b);
    return f(a, b) === opt1.equals_(opt2, f);
  }));
});
