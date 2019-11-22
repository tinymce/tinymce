import { Assert, UnitTest } from '@ephox/bedrock-client';
import fc from 'fast-check';
import * as ArbDataTypes from 'ephox/katamari/test/arb/ArbDataTypes';
import * as Arr from 'ephox/katamari/api/Arr';
import { Option, Options, OptionInstances } from '@ephox/katamari';

const { tOption } = OptionInstances;

UnitTest.test('Arr.findMap of empty is none', () => {
  fc.assert(fc.property(
    fc.func(ArbDataTypes.arbOption(fc.integer())),
    (f) => {
      Assert.eq('eq', Option.none(), Arr.findMap([ ], f), tOption());
    }
  ));
});

UnitTest.test('Arr.findMap of non-empty is first if f is Option.some', () => {
  fc.assert(fc.property(
    fc.array(fc.json(), 1, 40),
    (arr) => {
      Assert.eq('eq', Option.some(arr[0]), Arr.findMap(arr, Option.some), tOption());
    }
  ));
});

UnitTest.test('Arr.findMap of non-empty is none if f is Option.none', () => {
  fc.assert(fc.property(
    fc.array(fc.json(), 1, 40),
    (arr) => {
      Assert.eq('eq', Option.none(), Arr.findMap(arr, Option.none), tOption());
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
      const arr = prefix.concat([element]).concat(suffix);
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
