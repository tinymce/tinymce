import Arr from 'ephox/katamari/api/Arr';
import Jsc from '@ephox/wrap-jsverify';
import { UnitTest, assert } from '@ephox/bedrock';

UnitTest.test('Group By Test', function() {
  (function() {

    var check = function (input, expected) {
      assert.eq(expected, Arr.groupBy(input, function (b) { return b; }));
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
        var groups = Arr.groupBy(xs, function (x) {
          return f(x);
        });

        /* Properties about groups
         * 1. No two adjacent groups can have the same g(..) value
         * 2. Each group must have the same g(..) value
         */

        var hasEmptyGroups = Arr.exists(groups, function (g) {
          return g.length === 0;
        });

        if (hasEmptyGroups) return 'Should not have empty groups';
        // No consecutive groups should have the same result of g.
        var values = Arr.map(groups, function (group) {
          var first = f(group[0]);
          var mapped = Arr.map(group, function (g) { return f(g); });

          var isSame = Arr.forall(mapped, function (m) { return m === first; });
          if (!isSame) throw 'Not everything in a group has the same g(..) value';
          return first;
        });

        var hasSameGroup = Arr.exists(values, function (v, i) {
          return i > 0 ? values[i - 1] === values[i] : false;
        });

        if (hasSameGroup) return 'A group is next to another group with the same g(..) value';
        return true;
      }
    );

    Jsc.property(
      'Flattening groups equals the original array',
      Jsc.array(Jsc.json),
      Jsc.fun(Jsc.string),
      function (xs, f) {
        var groups = Arr.groupBy(xs, function (x) {
          return f(x);
        });

        var output = Arr.flatten(groups);
        return Jsc.eq(xs, output);
      }
    );
  })();
});

