import { Assert, UnitTest } from '@ephox/bedrock-client';
import fc from 'fast-check';
import * as Obj from 'ephox/katamari/api/Obj';

UnitTest.test('ObjEachTest', () => {
  const check = <T>(expected: Array<{index: string; value: T}>, input: Record<string, T>) => {
    const values: Array<{index: string; value: T}> = [];
    Obj.each(input, (x, i) => {
      values.push({ index: i, value: x });
    });
    Assert.eq('eq', expected, values);
  };

  check([], {});
  check([{ index: 'a', value: 'A' }], { a: 'A' });
  check([{ index: 'a', value: 'A' }, { index: 'b', value: 'B' }, { index: 'c', value: 'C' }], { a: 'A', b: 'B', c: 'C' });
});

UnitTest.test('Each + set should equal the same object', () => {
  fc.assert(fc.property(
    fc.dictionary(fc.asciiString(), fc.json()),
    (obj: Record<string, any>) => {
      const values = { };
      const output = Obj.each(obj, (x, i) => {
        values[i] = x;
      });
      Assert.eq('eq', obj, values);
      Assert.eq('output', undefined, output);
    }
  ));
});
