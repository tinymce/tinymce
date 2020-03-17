import * as Arr from 'ephox/katamari/api/Arr';
import * as Fun from 'ephox/katamari/api/Fun';
import { Assert, UnitTest } from '@ephox/bedrock-client';
import * as fc from 'fast-check';
import { Testable } from '@ephox/dispute';

const { tArray, tNumber } = Testable;

const dbl = (x) => x * 2;

const plus3 = (x) => x + 3;

UnitTest.test('Arr.map: unit tests', () => {

  const checkA = (expected, input, f) => {
    Assert.eq('map', expected, Arr.map(input, f));
    Assert.eq('map frozen', expected, Arr.map(Object.freeze(input.slice()), f));
  };

  checkA([], [], dbl);
  checkA([ 2 ], [ 1 ], dbl);
  checkA([ 4, 6, 10 ], [ 2, 3, 5 ], dbl);
});

UnitTest.test('Arr.map: functor laws', () => {
  fc.assert(fc.property(fc.array(fc.nat()), (xs) =>
    Assert.eq(
      'map id = id',
      Fun.identity(xs),
      Arr.map(xs, Fun.identity),
      tArray(tNumber)
    )
  ));

  const f = plus3;
  const g = dbl;

  fc.assert(fc.property(fc.array(fc.nat()), (xs) =>
    Assert.eq(
      'map (f . g) = map f . map g',
      Arr.map(xs, Fun.compose(f, g)),
      Arr.map(Arr.map(xs, g), f),
      tArray(tNumber)
    )
  ));
});
