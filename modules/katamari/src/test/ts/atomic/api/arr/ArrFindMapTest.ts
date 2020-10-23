import { Assert, UnitTest } from '@ephox/bedrock-client';
import fc from 'fast-check';
import * as Arr from 'ephox/katamari/api/Arr';
import * as Fun from 'ephox/katamari/api/Fun';
import { Optional } from 'ephox/katamari/api/Optional';
import { tOptional } from 'ephox/katamari/api/OptionalInstances';
import * as Optionals from 'ephox/katamari/api/Optionals';

UnitTest.test('Arr.findMap of empty is none', () => {
  Assert.eq('eq', Optional.none(), Arr.findMap([], Fun.die('⊥')), tOptional());
});

UnitTest.test('Arr.findMap of non-empty is first if f is Optional.some', () => {
  fc.assert(fc.property(
    fc.integer(),
    fc.array(fc.integer()),
    (head, tail) => {
      const arr = [ head, ...tail ];
      Assert.eq('eq', Optional.some(head), Arr.findMap(arr, Optional.some), tOptional());
    }
  ));
});

UnitTest.test('Arr.findMap of non-empty is none if f is Optional.none', () => {
  fc.assert(fc.property(
    fc.array(fc.integer()),
    (arr) => {
      Assert.eq('eq', Optional.none(), Arr.findMap(arr, () => Optional.none()), tOptional());
    }
  ));
});

UnitTest.test('Arr.findMap finds an element', () => {
  fc.assert(fc.property(
    fc.array(fc.integer()),
    fc.integer(),
    fc.integer(),
    fc.array(fc.integer()),
    (prefix, element, ret, suffix) => {
      const arr = [ ...prefix, element, ...suffix ];
      Assert.eq('eq', Optional.some(ret), Arr.findMap(arr, (x) => Optionals.someIf(x === element, ret)), tOptional());
    }
  ));
});

UnitTest.test('Arr.findMap does not find an element', () => {
  fc.assert(fc.property(
    fc.array(fc.nat()),
    fc.nat(),
    (arr, ret) => {
      Assert.eq('eq', Optional.none(), Arr.findMap(arr, (x) => Optionals.someIf(x === -1, ret)), tOptional());
    }
  ));
});
