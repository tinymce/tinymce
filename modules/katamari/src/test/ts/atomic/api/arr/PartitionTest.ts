import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';
import fc from 'fast-check';

import * as Arr from 'ephox/katamari/api/Arr';
import * as Fun from 'ephox/katamari/api/Fun';

describe('atomic.katamari.api.arr.PartitionTest', () => {
  it('unit tests', () => {
    const check = (input: string[], expected: { pass: string[]; fail: string[] }) => {
      const f = (n: string) => n.indexOf('yes') > -1;
      assert.deepEqual(Arr.partition(input, f), expected);
      assert.deepEqual(Arr.partition(Object.freeze(input.slice()), f), expected);
    };

    check([], { pass: [], fail: [] });
    check([ 'yes' ], { pass: [ 'yes' ], fail: [] });
    check([ 'no' ], { pass: [], fail: [ 'no' ] });
    check(
      [ 'yes', 'no', 'no', 'yes' ],
      {
        pass: [ 'yes', 'yes' ], fail: [ 'no', 'no' ]
      }
    );

    check(
      [ 'no 1', 'no 2', 'yes 1', 'yes 2', 'yes 3', 'no 3', 'no 4', 'yes 4', 'no 5', 'yes 5' ],
      {
        pass: [ 'yes 1', 'yes 2', 'yes 3', 'yes 4', 'yes 5' ], fail: [ 'no 1', 'no 2', 'no 3', 'no 4', 'no 5' ]
      }
    );
  });

  it('Check that if the filter always returns false, then everything is in "fail"', () => {
    fc.assert(fc.property(
      fc.array(fc.integer()),
      (arr) => {
        const output = Arr.partition(arr, Fun.never);
        assert.deepEqual(output.pass.length, 0);
        assert.deepEqual(output.fail, arr);
      }
    ));
  });

  it('Check that if the filter always returns true, then everything is in "pass"', () => {
    fc.assert(fc.property(
      fc.array(fc.integer()),
      (arr) => {
        const output = Arr.partition(arr, Fun.always);
        assert.deepEqual(output.fail.length, 0);
        assert.deepEqual(output.pass, arr);
      }
    ));
  });

  it('Check that everything in fail fails predicate and everything in pass passes predicate', () => {
    fc.assert(fc.property(
      fc.array(fc.integer()),
      (arr) => {
        const predicate = (x: number) => x % 3 === 0;
        const output = Arr.partition(arr, predicate);
        return Arr.forall(output.fail, (x) => !predicate(x)) && Arr.forall(output.pass, predicate);
      }
    ));
  });
});
