import * as Arr from 'ephox/katamari/api/Arr';
import * as Fun from 'ephox/katamari/api/Fun';
import { UnitTest, assert } from '@ephox/bedrock-client';
import * as fc from 'fast-check';
import { Eq } from '@ephox/dispute';

const dbl = (x) => x * 2;

const plus3 = (x) => x + 3;

UnitTest.test('Arr.map: unit tests', () => {

  const check = (expected, C, input, f) => {
    assert.eq(expected, C.map(input, f));
  };

  const checkA = (expected, input, f) => {
    check(expected, Arr, input, f);
    check(expected, Arr, Object.freeze(input.slice()), f);
  };

  checkA([], [], dbl);
  checkA([2], [1], dbl);
  checkA([4, 6, 10], [2, 3, 5], dbl);
});

UnitTest.test('Arr.map: map id xs = xs', () => {
  fc.assert(fc.property(fc.array(fc.nat()), (xs) =>
    Eq.eqArray(Eq.eqNumber).eq(
      Arr.map(xs, Fun.identity),
      xs
    )
  ));
});

UnitTest.test('Arr.map: map f . g = map f . map g', () => {
  const f = plus3;
  const g = dbl;

  fc.assert(fc.property(fc.array(fc.nat()), (xs) =>
    Eq.eqArray(Eq.eqNumber).eq(
      Arr.map(Arr.map(xs, g), f),
      Arr.map(xs, Fun.compose(f, g))
    )
  ));
});
