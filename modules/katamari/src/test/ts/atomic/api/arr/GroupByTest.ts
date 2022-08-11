import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';
import fc from 'fast-check';

import * as Arr from 'ephox/katamari/api/Arr';
import * as Fun from 'ephox/katamari/api/Fun';

describe('atomic.katamari.api.arr.GroupByTest', () => {

  it('unit tests', () => {
    const check = <T>(input: T[], expected: T[][]) => {
      const f = Fun.identity;
      assert.deepEqual(Arr.groupBy(input, f), expected);
      assert.deepEqual(Arr.groupBy(Object.freeze(input.slice()), f), expected);
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

  it('Adjacent groups have different hashes, and everything in a group has the same hash', () => {
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
          assert.fail('Should not have empty groups');
        }
        // No consecutive groups should have the same result of g.
        const values = Arr.map(groups, (group) => {
          const first = f(group[0]);
          const mapped = Arr.map(group, (g) => f(g));

          const isSame = Arr.forall(mapped, (m) => m === first);
          if (!isSame) {
            assert.fail('Not everything in a group has the same g(..) value');
          }
          return first;
        });

        const hasSameGroup = Arr.exists(values, (v, i) => i > 0 ? values[i - 1] === values[i] : false);

        if (hasSameGroup) {
          assert.fail('A group is next to another group with the same g(..) value');
        }
        return true;
      }
    ));
  });

  it('Flattening groups equals the original array', () => {
    fc.assert(fc.property(
      fc.array(fc.integer()),
      fc.func(fc.string()),
      (xs, f) => {
        const groups = Arr.groupBy(xs, (x) => f(x));

        const output = Arr.flatten(groups);
        assert.deepEqual(output, xs);
      }
    ));
  });
});
