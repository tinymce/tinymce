import * as Arr from 'ephox/katamari/api/Arr';
import * as Fun from 'ephox/katamari/api/Fun';
import * as Obj from 'ephox/katamari/api/Obj';
import { Assert, UnitTest } from '@ephox/bedrock-client';
import fc from 'fast-check';

UnitTest.test('Obj.map: unit test', () => {
  const dbl = (x) => x * 2;

  const addDot = (x) => x + '.';

  const tupleF = (x, i) => ({
    k: i + 'b',
    v: x + 'b'
  });

  const check = (expected, input, f) => {
    Assert.eq('check', expected, Obj.map(input, f));
  };

  const checkT = (expected, input, f) => {
    Assert.eq(' checkt', expected, Obj.tupleMap(input, f));
  };

  check({}, {}, dbl);
  check({ a: 'a.' }, { a: 'a' }, addDot);
  check({ a: 'a.', b: 'b.', c: 'c.' }, { a: 'a', b: 'b', c: 'c' }, addDot);

  checkT({}, {}, tupleF);
  checkT({ ab: 'ab' }, { a: 'a' }, tupleF);
  checkT({ ab: 'ab', bb: 'bb', cb: 'cb' }, { a: 'a', b: 'b', c: 'c' }, tupleF);

  const stringify = (x, i) => i + ' :: ' + x;

  const checkMapToArray = (expected, input, f) => {
    Assert.eq('checkMapToArray', expected, Obj.mapToArray(input, f));
  };

  checkMapToArray([], {}, stringify);
  checkMapToArray([ 'a :: a' ], { a: 'a' }, stringify);
  checkMapToArray([ 'a :: a', 'b :: b', 'c :: c' ], { a: 'a', b: 'b', c: 'c' }, stringify);
});

UnitTest.test('Obj.map: map id obj = obj', () => {
  fc.assert(fc.property(fc.dictionary(fc.asciiString(), fc.integer()), (obj) => {
    const actual = Obj.map(obj, Fun.identity);
    Assert.eq('map id', obj, actual);
  }));
});

UnitTest.test('map constant obj means that values(obj) are all the constant', () => {
  fc.assert(fc.property(fc.dictionary(fc.asciiString(), fc.integer()), fc.integer(), (obj, x) => {
    const output = Obj.map(obj, Fun.constant(x));
    const values = Obj.values(output);
    return Arr.forall(values, (v) => v === x);
  }));
});

UnitTest.test('tupleMap obj (x, i) -> { k: i, v: x }', () => {
  fc.assert(fc.property(fc.dictionary(fc.asciiString(), fc.integer()), (obj) => {
    const output = Obj.tupleMap(obj, (x, i) => ({ k: i, v: x }));
    Assert.eq('tupleMap', obj, output);
  }));
});

UnitTest.test('mapToArray is symmetric with tupleMap', () => {
  fc.assert(fc.property(fc.dictionary(fc.asciiString(), fc.integer()), (obj) => {
    const array = Obj.mapToArray(obj, (x, i) => ({ k: i, v: x }));

    const aKeys = Arr.map(array, (x) => x.k);
    const aValues = Arr.map(array, (x) => x.v);

    const keys = Obj.keys(obj);
    const values = Obj.values(obj);

    Assert.eq('same keys', Arr.sort(keys), Arr.sort(aKeys));
    Assert.eq('same values', Arr.sort(values), Arr.sort(aValues));
  }));
});
