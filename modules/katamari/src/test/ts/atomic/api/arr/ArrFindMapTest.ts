import { Assert, UnitTest } from '@ephox/bedrock-client';
import fc from 'fast-check';
import * as ArbDataTypes from 'ephox/katamari/test/arb/ArbDataTypes';
import * as Arr from 'ephox/katamari/api/Arr';
import { Option } from '@ephox/katamari';

UnitTest.test('Arr.findMap of empty is none', () => {
  fc.assert(fc.property(
    fc.func(ArbDataTypes.arbOption(fc.integer())),
    (f) => {
      Assert.eq('eq',  true, Arr.findMap([ ], f).isNone());
    }
  ));
});

UnitTest.test('Arr.findMap of non-empty is first if f is Option.some', () => {
  fc.assert(fc.property(
    fc.array(fc.json(), 1, 40),
    (arr) => {
      Assert.eq('eq',  arr[0], Arr.findMap(arr, Option.some).getOrDie());
    }
  ));
});

UnitTest.test('Arr.findMap of non-empty is none if f is Option.none', () => {
  fc.assert(fc.property(
    fc.array(fc.json(), 1, 40),
    (arr) => {
      Assert.eq('eq',  true, Arr.findMap(arr, Option.none).isNone());
    }
  ));
});
