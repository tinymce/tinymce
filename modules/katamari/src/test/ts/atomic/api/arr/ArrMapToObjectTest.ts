import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';
import * as fc from 'fast-check';

import * as Arr from 'ephox/katamari/api/Arr';
import * as Obj from 'ephox/katamari/api/Obj';
import * as Unique from 'ephox/katamari/api/Unique';

describe('atomic.katamari.api.arr.ArrMapToObjectTest', () => {
  it('maps to object', () => {

    const checkToObject = <T extends {}, U extends {}>(expected: U, input: T[], f: (x: T) => U[keyof U]) => {
      assert.deepEqual(expected, Arr.mapToObject(input, f));
      assert.deepEqual(expected, Arr.mapToObject(Object.freeze(input.slice()), f));
    };

    checkToObject({}, [], () => {
      throw new Error('boom');
    });
    checkToObject({ a: '3a' }, [ 'a' ], (x) => 3 + x);
    checkToObject({ a: '3a', b: '3b' }, [ 'a', 'b' ], (x) => 3 + x);
    checkToObject({ 1: 4, 2: 5 }, [ 1, 2 ], (x) => 3 + x);

    fc.assert(fc.property(fc.array(fc.asciiString()), (keys) => {
      const f = (x: string) => x + '_cat';
      const inputKeys = Arr.sort(Unique.stringArray(keys));
      const output = Arr.mapToObject(inputKeys, f);
      const outputKeys = Arr.sort(Obj.keys(output));

      assert.deepEqual(inputKeys, outputKeys);
      assert.isTrue(Arr.forall(outputKeys, (ok) => f(ok) === output[ok]));
    }));
  });
});
