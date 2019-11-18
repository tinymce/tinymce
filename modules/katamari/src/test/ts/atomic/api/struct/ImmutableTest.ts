import * as Arr from 'ephox/katamari/api/Arr';
import * as Obj from 'ephox/katamari/api/Obj';
import * as Struct from 'ephox/katamari/api/Struct';
import fc from 'fast-check';
import { UnitTest, Assert } from '@ephox/bedrock-client';

UnitTest.test('Struct.immutable', () => {
  const Thing = Struct.immutable('fred', 'barney');
  const thing = Thing('hello', 1);
  Assert.eq('eq', 'hello', thing.fred());
  Assert.eq('eq', 1, thing.barney());
});

const toUnique = (array: string[]) => {
  const r = { };
  Arr.each(array, (v) => {
    r[v] = {};
  });
  return Obj.keys(r);
};

UnitTest.test('Checking struct with right number of arguments', () => {
  fc.assert(fc.property(
    fc.array(fc.string(), 1, 40),
    (rawValues: string[]) => {
      // Remove duplications.
      const values = toUnique(rawValues);

      const struct = Struct.immutable.apply(undefined, values);
      const output = struct.apply(undefined, values);

      const evaluated = Obj.mapToArray(output, (v, k) => v());

      Assert.eq('eq', evaluated, values);
    }
  ));
});

UnitTest.test('Checking struct with one fewer argument', () => {
  fc.assert(fc.property(
    fc.array(fc.string(), 1, 40),
    (rawValues: string[]) => {
      // Remove duplications.
      const values = toUnique(rawValues);

      const struct = Struct.immutable.apply(undefined, values);
      try {
        struct.apply(undefined, values.slice(1));
        return false;
      } catch (err) {
        return err.message.indexOf('Wrong number') > -1;
      }
    }
  ));
});

UnitTest.test('Checking struct with fewer arguments', () => {
  fc.assert(fc.property(
    fc.array(fc.string(), 1, 40),
    fc.integer(1, 10),
    (rawValues: string[], numToExclude: number) => {
      // Remove duplications.
      const values = toUnique(rawValues);

      const struct = Struct.immutable.apply(undefined, values);
      try {
        struct.apply(undefined, values.slice(numToExclude));
        return false;
      } catch (err) {
        return err.message.indexOf('Wrong number') > -1;
      }
    }
  ));
});

UnitTest.test('Checking struct with more arguments', () => {
  fc.assert(fc.property(
    fc.array(fc.string(), 1, 40),
    fc.array(fc.string(), 1, 40),
    (rawValues: string[], extra: string[]) => {
      // Remove duplications.
      const values = toUnique(rawValues);

      const struct = Struct.immutable.apply(undefined, values);
      try {
        struct.apply(undefined, values.concat(extra));
        return false;
      } catch (err) {
        return err.message.indexOf('Wrong number') > -1;
      }
    }
  ));
});
