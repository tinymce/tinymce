import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';
import fc from 'fast-check';

import * as Arr from 'ephox/katamari/api/Arr';
import * as Fun from 'ephox/katamari/api/Fun';
import * as Obj from 'ephox/katamari/api/Obj';

describe('atomic.katamari.api.obj.ObjMapTest', () => {
  it('unit test', () => {
    const dbl = (x: number) => x * 2;

    const addDot = (x: string) => x + '.';

    const tupleF = (x: string, i: string) => ({
      k: i + 'b',
      v: x + 'b'
    });

    const check = <T, U>(expected: Record<string, U>, input: Record<string, T>, f: (val: T) => U) => {
      assert.deepEqual(Obj.map(input, f), expected);
    };

    const checkT = <T, R extends {}>(expected: Record<string, R>, input: Record<string, T>, f: (val: T, key: string) => { k: string; v: R }) => {
      assert.deepEqual(Obj.tupleMap(input, f), expected);
    };

    check({}, {}, dbl);
    check({ a: 'a.' }, { a: 'a' }, addDot);
    check({ a: 'a.', b: 'b.', c: 'c.' }, { a: 'a', b: 'b', c: 'c' }, addDot);

    checkT({}, {}, tupleF);
    checkT({ ab: 'ab' }, { a: 'a' }, tupleF);
    checkT({ ab: 'ab', bb: 'bb', cb: 'cb' }, { a: 'a', b: 'b', c: 'c' }, tupleF);

    const stringify = (x: string, i: string) => i + ' :: ' + x;

    const checkMapToArray = (expected: string[], input: Record<string, string>, f: (x: string, i: string) => string) => {
      assert.deepEqual(Obj.mapToArray(input, f), expected);
    };

    checkMapToArray([], {}, stringify);
    checkMapToArray([ 'a :: a' ], { a: 'a' }, stringify);
    checkMapToArray([ 'a :: a', 'b :: b', 'c :: c' ], { a: 'a', b: 'b', c: 'c' }, stringify);
  });

  it('map id obj = obj', () => {
    fc.assert(fc.property(fc.dictionary(fc.asciiString(), fc.integer()), (obj) => {
      const actual = Obj.map(obj, Fun.identity);
      assert.deepEqual(actual, obj);
    }));
  });

  it('map constant obj means that values(obj) are all the constant', () => {
    fc.assert(fc.property(fc.dictionary(fc.asciiString(), fc.integer()), fc.integer(), (obj, x) => {
      const output = Obj.map(obj, Fun.constant(x));
      const values = Obj.values(output);
      return Arr.forall(values, (v) => v === x);
    }));
  });

  it('tupleMap obj (x, i) -> { k: i, v: x }', () => {
    fc.assert(fc.property(fc.dictionary(fc.asciiString(), fc.integer()), (obj) => {
      const output = Obj.tupleMap(obj, (x, i) => ({ k: i, v: x }));
      assert.deepEqual(output, obj);
    }));
  });

  it('mapToArray is symmetric with tupleMap', () => {
    fc.assert(fc.property(fc.dictionary(fc.asciiString(), fc.integer()), (obj) => {
      const array = Obj.mapToArray(obj, (x, i) => ({ k: i, v: x }));

      const aKeys = Arr.map(array, (x) => x.k);
      const aValues = Arr.map(array, (x) => x.v);

      const keys = Obj.keys(obj);
      const values = Obj.values(obj);

      assert.deepEqual(Arr.sort(aKeys), Arr.sort(keys));
      assert.deepEqual(Arr.sort(aValues), Arr.sort(values));
    }));
  });
});
