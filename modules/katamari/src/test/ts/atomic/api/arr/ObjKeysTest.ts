import * as Arr from 'ephox/katamari/api/Arr';
import * as Obj from 'ephox/katamari/api/Obj';
import { UnitTest, Assert } from '@ephox/bedrock-client';
import fc from 'fast-check';

UnitTest.test('Obj.keys: unit tests', () => {
  const check = (expKeys, input) => {
    const c = (expected, v) => {
      v.sort();
      Assert.eq('keys', expected, v);
    };

    c(expKeys, Obj.keys(input));
  };

  check([], {});
  check(['a'], { a: 'A' });
  check(['a', 'b', 'c'], { a: 'A', c: 'C', b: 'B' });
});

UnitTest.test('Obj.keys are all in input', () => {
  fc.assert(fc.property(fc.dictionary(fc.asciiString(), fc.integer()), (obj) => {
    const keys = Obj.keys(obj);
    return Arr.forall(keys, (k) => obj.hasOwnProperty(k));
  }));
});
