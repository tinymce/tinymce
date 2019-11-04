import * as Arr from 'ephox/katamari/api/Arr';
import * as Fun from 'ephox/katamari/api/Fun';
import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Testable } from '@ephox/dispute';
import fc from 'fast-check';

const { tArray, tNumber } = Testable;

UnitTest.test('Arr.bind: unit tests', () => {
  const len = (x) => [ x.length ];

  const check = (expected, input: any[], f) => {
    Assert.eq('check', expected, Arr.bind(input, f), tArray(tNumber));
    Assert.eq('check frozen', expected, Arr.bind(Object.freeze(input.slice()), f), tArray(tNumber));
  };

  check([], [], len);
  check([ 1 ], [ [ 1 ] ], len);
  check([ 1, 1 ], [ [ 1 ], [ 2 ] ], len);
  check([ 2, 0, 1, 2, 0 ], [ [ 1, 2 ], [], [ 3 ], [ 4, 5 ], [] ], len);
});

UnitTest.test('Arr.bind: binding an array of empty arrays with identity equals an empty array', () => {
  fc.assert(fc.property(fc.array(fc.constant<number[]>([])), (arr) => {
    Assert.eq('bind empty arrays', [], Arr.bind(arr, Fun.identity), tArray(tNumber));
  }));
});

UnitTest.test('Arr.bind: bind (pure .) is map', () => {
  fc.assert(fc.property(fc.array(fc.integer()), fc.integer(), (arr, j) => {
    const f = (x: number) => x + j;
    Assert.eq('bind pure', Arr.map(arr, f), Arr.bind(arr, Fun.compose(Arr.pure, f)), tArray(tNumber));
  }));
});

UnitTest.test('Arr.bind: Monad Law: left identity', () => {
  fc.assert(fc.property(fc.integer(), fc.integer(), (i, j) => {
    const f = (x: number) => [x, j, x + j];
    Assert.eq('left id', f(i), Arr.bind(Arr.pure(i), f), tArray(tNumber));
  }));
});

UnitTest.test('Arr.bind: Monad Law: right identity', () => {
  fc.assert(fc.property(fc.array(fc.integer()), (arr) => {
    Assert.eq('right id', arr, Arr.bind(arr, Arr.pure), tArray(tNumber));
  }));
});

UnitTest.test('Arr.bind: Monad Law: associativity', () => {
  fc.assert(fc.property(fc.array(fc.integer()), fc.integer(), (arr, j) => {
    const f = (x: number) => [x, j, x + j];
    const g = (x: number) => [j, x, x + j];
    Assert.eq('assoc', Arr.bind(arr, (x) => Arr.bind(f(x), g)), Arr.bind(Arr.bind(arr, f), g), tArray(tNumber));
  }));
});
