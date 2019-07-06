import * as Arr from 'ephox/katamari/api/Arr';
import Jsc from '@ephox/wrap-jsverify';
import { UnitTest, assert } from '@ephox/bedrock';

UnitTest.test('Group By Test', function () {
  (function () {

    const check = function (input: any[], expected) {
      const f = function (b) { return b; };
      assert.eq(expected, Arr.groupBy(input, f));
      assert.eq(expected, Arr.groupBy(Object.freeze(input.slice()), f));
    };

    check([], []);
    check([true], [[true]]);
    check([false], [[false]]);
    check(
      [true, false, false, true],
      [
        [true], [false, false], [true]
      ]
    );
    check(
      [undefined, 1, 2, undefined, undefined, undefined, 1, 2],
      [
        [undefined], [1], [2], [undefined, undefined, undefined], [1], [2]
      ]
    );
    check(
      [{}, 1, 2, undefined, undefined, undefined, 1, 2],
      [
        [{}], [1], [2], [undefined, undefined, undefined], [1], [2]
      ]
    );

    check(
      [false, false, true, true, true, false, false, true, false, true],
      [
        [false, false], [true, true, true], [false, false], [true], [false], [true]
      ]
    );

    Jsc.property(
      'Adjacent groups have different hashes, and everything in a group has the same hash',
      Jsc.array(Jsc.json),
      Jsc.fun(Jsc.string),
      function (xs, f) {
        const groups = Arr.groupBy(xs, function (x) {
          return f(x);
        });

        /* Properties about groups
         * 1. No two adjacent groups can have the same g(..) value
         * 2. Each group must have the same g(..) value
         */

        const hasEmptyGroups = Arr.exists(groups, function (g) {
          return g.length === 0;
        });

        if (hasEmptyGroups) {
          return 'Should not have empty groups';
        }
        // No consecutive groups should have the same result of g.
        const values = Arr.map(groups, function (group) {
          const first = f(group[0]);
          const mapped = Arr.map(group, function (g) { return f(g); });

          const isSame = Arr.forall(mapped, function (m) { return m === first; });
          if (!isSame) {
            throw new Error('Not everything in a group has the same g(..) value');
          }
          return first;
        });

        const hasSameGroup = Arr.exists(values, function (v, i) {
          return i > 0 ? values[i - 1] === values[i] : false;
        });

        if (hasSameGroup) {
          return 'A group is next to another group with the same g(..) value';
        }
        return true;
      }
    );

    Jsc.property(
      'Flattening groups equals the original array',
      Jsc.array(Jsc.json),
      Jsc.fun(Jsc.string),
      function (xs, f) {
        const groups = Arr.groupBy(xs, function (x) {
          return f(x);
        });

        const output = Arr.flatten(groups);
        return Jsc.eq(xs, output);
      }
    );
  })();
});
