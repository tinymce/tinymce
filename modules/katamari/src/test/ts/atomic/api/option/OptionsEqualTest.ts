import * as Options from 'ephox/katamari/api/Options';
import { Option } from 'ephox/katamari/api/Option';
import { arbOptionSome as arbOptionSome } from 'ephox/katamari/test/arb/ArbDataTypes';

import { Assert, UnitTest } from '@ephox/bedrock-client';
import fc from 'fast-check';
import * as Fun from 'ephox/katamari/api/Fun';

const boom = Fun.die('boom');

UnitTest.test('Options.equals: none === none', () => {
  Assert.eq('eq', true, Option.none().equals(Option.none()));
});

UnitTest.test('Option.none() !== Option.some(x)', () => {
  fc.assert(fc.property(fc.integer(), (i) => {
    Assert.eq('eq', false, Option.none().equals(Option.some(i)));
  }));
});

UnitTest.test('Option.some(x) !== Option.none()', () => {
  fc.assert(fc.property(fc.integer(), (i) => {
    Assert.eq('eq', false, (Option.some(i).equals(Option.none())));
  }));
});

UnitTest.test('Option.some(x) === Option.some(x)', () => {
  fc.assert(fc.property(fc.integer(), (i) => {
    return Assert.eq('eq', true, Option.some(i).equals(Option.some(i)));
  }));
});

UnitTest.test('Option.some(x) === Option.some(x) (same ref)', () => {
  fc.assert(fc.property(fc.integer(), (i) => {
    const ob = Option.some(i);
    Assert.eq('eq',  true, ob.equals(ob));
  }));
});

UnitTest.test('Option.some(x) !== Option.some(x + y) where y is not identity', () => {
  fc.assert(fc.property(fc.string(), fc.string(1, 40), (a, b) => {
    Assert.eq('eq', false, Option.some(a).equals(Option.some(a + b)));
  }));
});

UnitTest.test('Option.some: unit tests', () => {
  Assert.eq('eq', true, Option.none().equals(Option.none()));
  Assert.eq('eq', false, Option.none().equals(Option.some(3)));

  Assert.eq('eq', false, Option.some(4).equals(Option.none()));
  Assert.eq('eq', false, Option.some(2).equals(Option.some(4)));
  Assert.eq('eq', true,  Option.some(5).equals(Option.some(5)));
  Assert.eq('eq', false, Option.some(5.1).equals(Option.some(5.3)));

  const comparator = (a, b) => Math.round(a) === Math.round(b);

  Assert.eq('eq', true, Option.some(5.1).equals_(Option.some(5.3), comparator));
  Assert.eq('eq', false, Option.some(5.1).equals_(Option.some(5.9), comparator));
});

UnitTest.test('Options.equals_', () => {
  Assert.eq('eq', true, Option.none().equals_(Option.none(), boom));
});

UnitTest.test('some !== none, for any predicate', () => {
  fc.assert(fc.property(arbOptionSome(fc.integer()), (opt1) => {
    Assert.eq('eq',  false, opt1.equals_(Option.none(), boom));
  }));
});

UnitTest.test('none !== some, for any predicate', () => {
  fc.assert(fc.property(arbOptionSome(fc.integer()), (opt1) => {
    Assert.eq('eq',  false, Option.none().equals_(opt1, boom));
  }));
});

UnitTest.test('Checking some(x).equals_(some(y), _, _ -> false) === false', () => {
  fc.assert(fc.property(arbOptionSome(fc.integer()), arbOptionSome(fc.integer()), (opt1, opt2) => {
    Assert.eq('eq',  false, opt1.equals_(opt2, Fun.constant(false)));
  }));
});

UnitTest.test('Checking some(x).equals_(some(y), _, _ -> true) === true', () => {
  fc.assert(fc.property(fc.integer(), fc.integer(), (a, b) => {
    const opt1 = Option.some(a);
    const opt2 = Option.some(b);
    Assert.eq('eq',  true, opt1.equals_(opt2, Fun.constant(true)));
  }));
});

UnitTest.test('Checking some(x).equals_(some(y), f) iff. f(x, y)', () => {
  fc.assert(fc.property(arbOptionSome(fc.integer()), arbOptionSome(fc.integer()), fc.func(fc.boolean()), (a, b, f) => {
    const opt1 = Option.some(a);
    const opt2 = Option.some(b);
    return f(a, b) === opt1.equals_(opt2, f);
  }));
});
