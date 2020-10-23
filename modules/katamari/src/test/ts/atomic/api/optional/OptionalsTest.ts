import { Assert, UnitTest } from '@ephox/bedrock-client';
import fc from 'fast-check';
import * as Arr from 'ephox/katamari/api/Arr';
import * as Fun from 'ephox/katamari/api/Fun';
import { Optional } from 'ephox/katamari/api/Optional';
import * as Optionals from 'ephox/katamari/api/Optionals';
import * as ArbDataTypes from 'ephox/katamari/test/arb/ArbDataTypes';

UnitTest.test('OptionsTest', () => {
  const arr1 = [ Optional.some(1), Optional.none(), Optional.some(2), Optional.some(3), Optional.none(), Optional.none(), Optional.none(), Optional.none(), Optional.some(4) ];
  Assert.eq('eq', [ 1, 2, 3, 4 ], Optionals.cat(arr1));

  Assert.eq('each returns undefined 1', undefined, Optional.some(1).each(Fun.identity));
  Assert.eq('each returns undefined 2', undefined, Optional.none().each(Fun.identity));
});

UnitTest.test('Optionals.cat of only nones should be an empty array', () => {
  fc.assert(fc.property(
    fc.array(ArbDataTypes.arbOptionalNone()),
    (options) => {
      const output = Optionals.cat(options);
      Assert.eq('eq', 0, output.length);
    }
  ));
});

UnitTest.test('Optionals.cat of only somes should have the same length', () => {
  fc.assert(fc.property(
    fc.array(ArbDataTypes.arbOptionalSome(fc.integer())),
    (options) => {
      const output = Optionals.cat(options);
      Assert.eq('eq', options.length, output.length);
    }
  ));
});

UnitTest.test('Optionals.cat of Arr.map(xs, Optional.some) should be xs', () => {
  fc.assert(fc.property(
    fc.array(fc.json()),
    (arr) => {
      const options = Arr.map(arr, Optional.some);
      const output = Optionals.cat(options);
      Assert.eq('eq', arr, output);
    }
  ));
});

UnitTest.test('Optionals.cat of somes and nones should have length <= original', () => {
  fc.assert(fc.property(
    fc.array(ArbDataTypes.arbOptional(fc.integer())),
    (arr) => {
      const output = Optionals.cat(arr);
      Assert.eq('eq', output.length <= arr.length, true);
    }
  ));
});

UnitTest.test('Optionals.cat of nones.concat(somes).concat(nones) should be somes', () => {
  fc.assert(fc.property(
    fc.array(fc.json()),
    fc.array(fc.json()),
    fc.array(fc.json()),
    (before, on, after) => {
      const beforeNones = Arr.map(before, Optional.none);
      const afterNones = Arr.map(after, Optional.none);
      const onSomes = Arr.map(on, Optional.some);
      const output = Optionals.cat(beforeNones.concat(onSomes).concat(afterNones));
      Assert.eq('eq', on, output);
    }
  ));
});
