import { Assert, UnitTest } from '@ephox/bedrock-client';
import fc from 'fast-check';
import { Option, Options, OptionInstances, Arr, Fun } from 'ephox/katamari/api/Main';

const { tOption } = OptionInstances;

UnitTest.test('Arr.findMap of empty is none', () => {
  Assert.eq('eq', Option.none(), Arr.findMap([], Fun.die('⊥')), tOption());
});

UnitTest.test('Arr.findMap of non-empty is first if f is Option.some', () => {
  fc.assert(fc.property(
    fc.integer(),
    fc.array(fc.integer()),
    (head, tail) => {
      const arr = [ head, ...tail ];
      Assert.eq('eq', Option.some(head), Arr.findMap(arr, Option.some), tOption());
    }
  ));
});

UnitTest.test('Arr.findMap of non-empty is none if f is Option.none', () => {
  fc.assert(fc.property(
    fc.array(fc.integer()),
    (arr) => {
      Assert.eq('eq', Option.none(), Arr.findMap(arr, () => Option.none()), tOption());
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
      Assert.eq('eq', Option.some(ret), Arr.findMap(arr, (x) => Options.someIf(x === element, ret)), tOption());
    }
  ));
});

UnitTest.test('Arr.findMap does not find an element', () => {
  fc.assert(fc.property(
    fc.array(fc.nat()),
    fc.nat(),
    (arr, ret) => {
      Assert.eq('eq', Option.none(), Arr.findMap(arr, (x) => Options.someIf(x === -1, ret)), tOption());
    }
  ));
});
