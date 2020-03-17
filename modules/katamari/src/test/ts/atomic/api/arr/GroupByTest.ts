import * as Arr from 'ephox/katamari/api/Arr';
import { UnitTest, Assert } from '@ephox/bedrock-client';
import fc from 'fast-check';

UnitTest.test('Arr.groupBy: unit tests', () => {
  const check = (input: unknown[], expected) => {
    const f = (b) => b;
    Assert.eq('groupBy', expected, Arr.groupBy(input, f));
    Assert.eq('groupBy frozen', expected, Arr.groupBy(Object.freeze(input.slice()), f));
  };

  check([], []);
  check([ true ], [[ true ]]);
  check([ false ], [[ false ]]);
  check(
    [ true, false, false, true ],
    [
      [ true ], [ false, false ], [ true ]
    ]
  );
  check(
    [ undefined, 1, 2, undefined, undefined, undefined, 1, 2 ],
    [
      [ undefined ], [ 1 ], [ 2 ], [ undefined, undefined, undefined ], [ 1 ], [ 2 ]
    ]
  );
  check(
    [{}, 1, 2, undefined, undefined, undefined, 1, 2 ],
    [
      [{}], [ 1 ], [ 2 ], [ undefined, undefined, undefined ], [ 1 ], [ 2 ]
    ]
  );

  check(
    [ false, false, true, true, true, false, false, true, false, true ],
    [
      [ false, false ], [ true, true, true ], [ false, false ], [ true ], [ false ], [ true ]
    ]
  );
});

UnitTest.test('Arr.groupBy: Adjacent groups have different hashes, and everything in a group has the same hash', () => {
  fc.assert(fc.property(
    fc.array(fc.integer()),
    fc.func(fc.asciiString()),
    (xs, f) => {
      const groups = Arr.groupBy(xs, (x) => f(x));

      /* Properties about groups
       * 1. No two adjacent groups can have the same g(..) value
       * 2. Each group must have the same g(..) value
       */

      const hasEmptyGroups = Arr.exists(groups, (g) => g.length === 0);

      if (hasEmptyGroups) {
        Assert.fail('Should not have empty groups');
      }
      // No consecutive groups should have the same result of g.
      const values = Arr.map(groups, (group) => {
        const first = f(group[0]);
        const mapped = Arr.map(group, (g) => f(g));

        const isSame = Arr.forall(mapped, (m) => m === first);
        if (!isSame) {
          Assert.fail('Not everything in a group has the same g(..) value');
        }
        return first;
      });

      const hasSameGroup = Arr.exists(values, (v, i) => i > 0 ? values[i - 1] === values[i] : false);

      if (hasSameGroup) {
        Assert.fail('A group is next to another group with the same g(..) value');
      }
      return true;
    }
  ));
});

UnitTest.test('Flattening groups equals the original array', () => {
  fc.assert(fc.property(
    fc.array(fc.integer()),
    fc.func(fc.string()),
    (xs, f) => {
      const groups = Arr.groupBy(xs, (x) => f(x));

      const output = Arr.flatten(groups);
      Assert.eq('eq', xs, output);
    }
  ));
});
