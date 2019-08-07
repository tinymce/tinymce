import * as Arr from 'ephox/katamari/api/Arr';
import * as Obj from 'ephox/katamari/api/Obj';
import * as Struct from 'ephox/katamari/api/Struct';
import Jsc from '@ephox/wrap-jsverify';
import { UnitTest, assert } from '@ephox/bedrock';

UnitTest.test('Struct.immutable', function () {
  const Thing = Struct.immutable('fred', 'barney');
  const thing = Thing('hello', 1);
  assert.eq('hello', thing.fred());
  assert.eq(1, thing.barney());

  const toUnique = function (array: string[]) {
    const r = { };
    Arr.each(array, function (v) {
      r[v] = {};
    });
    return Obj.keys(r);
  };

  Jsc.property(
    'Checking struct with right number of arguments',
    Jsc.nearray(Jsc.string),
    function (rawValues: string[]) {
      // Remove duplications.
      const values = toUnique(rawValues);

      const struct = Struct.immutable.apply(undefined, values);
      const output = struct.apply(undefined, values);

      const evaluated = Obj.mapToArray(output, function (v, k) {
        return v();
      });

      return Jsc.eq(evaluated, values);
    }
  );

  Jsc.property(
    'Checking struct with one fewer argument',
    Jsc.nearray(Jsc.string),
    function (rawValues: string[]) {
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
  );

  Jsc.property(
    'Checking struct with fewer arguments',
    Jsc.nearray(Jsc.string),
    Jsc.integer(1, 10),
    function (rawValues: string[], numToExclude: number) {
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
  );

  Jsc.property(
    'Checking struct with more arguments',
    Jsc.nearray(Jsc.string),
    Jsc.nearray(Jsc.string),
    function (rawValues: string[], extra: string[]) {
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
  );
});
