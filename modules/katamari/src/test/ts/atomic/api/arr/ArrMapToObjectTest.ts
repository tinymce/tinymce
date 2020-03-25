import * as Arr from 'ephox/katamari/api/Arr';
import * as Obj from 'ephox/katamari/api/Obj';
import * as Unique from 'ephox/katamari/api/Unique';
import { UnitTest, assert } from '@ephox/bedrock-client';
import * as fc from 'fast-check';
import { Eq } from '@ephox/dispute';

UnitTest.test('Arr.mapToObject', () => {
  const checkToObject = (expected, input: any[], f) => {
    assert.eq(expected, Arr.mapToObject(input, f));
    assert.eq(expected, Arr.mapToObject(Object.freeze(input.slice()), f));
  };

  checkToObject({}, [], () => {
    throw new Error('boom');
  });
  checkToObject({ a: '3a' }, [ 'a' ], (x) => 3 + x);
  checkToObject({ a: '3a', b: '3b' }, [ 'a', 'b' ], (x) => 3 + x);
  checkToObject({ 1: 4, 2: 5 }, [ 1, 2 ], (x) => 3 + x);

  fc.assert(fc.property(fc.array(fc.asciiString()), (keys) => {
    const f = (x) => x + '_cat';
    const inputKeys = Arr.sort(Unique.stringArray(keys));
    const output = Arr.mapToObject(inputKeys, f);
    const outputKeys = Arr.sort(Obj.keys(output));

    return Eq.eqArray(Eq.eqString).eq(inputKeys, outputKeys) &&
      Arr.forall(outputKeys, (ok) => f(ok) === output[ok]
      );
  }));
});
