import * as Obj from 'ephox/katamari/api/Obj';
import { UnitTest, assert, Assert } from '@ephox/bedrock-client';
import fc from 'fast-check';

UnitTest.test('Obj.size: unit tests', function () {
  const check = function (expected, input) {
    assert.eq(expected, Obj.size(input));
  };

  check(0, {});
  check(1, { a: 'a' });
  check(3, { a: 'a', b: 'b', c: 'c' });
});

UnitTest.test('Obj.size: inductive case', () => {
  fc.assert(fc.property(
    fc.dictionary(fc.asciiString(), fc.integer()),
    fc.asciiString(),
    fc.integer(),
    (obj, k, v) => {
    const objWithoutK = Obj.filter(obj, (x, i) => i !== k);
    Assert.eq('Adding key adds 1 to size',
      Obj.size(objWithoutK) + 1,
      Obj.size({k: v, ...objWithoutK})
    );
  }));
});
