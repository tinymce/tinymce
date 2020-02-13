import * as Arr from 'ephox/katamari/api/Arr';
import * as Fun from 'ephox/katamari/api/Fun';
import { UnitTest, Assert } from '@ephox/bedrock-client';
import fc from 'fast-check';

UnitTest.test('Arr.partition: unit tests', () => {
  const check = (input: unknown[], expected) => {
    const f = (n) => n.indexOf('yes') > -1;
    Assert.eq('partition', expected, Arr.partition(input, f));
    Assert.eq('partition frozen', expected, Arr.partition(Object.freeze(input.slice()), f));
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

UnitTest.test('Check that if the filter always returns false, then everything is in "fail"', () => {
  fc.assert(fc.property(
    fc.array(fc.integer()),
    (arr) => {
      const output = Arr.partition(arr, Fun.constant(false));
      Assert.eq('eq', 0, output.pass.length);
      Assert.eq('eq', arr, output.fail);
    }
  ));
});

UnitTest.test('Check that if the filter always returns true, then everything is in "pass"', () => {
  fc.assert(fc.property(
    fc.array(fc.integer()),
    (arr) => {
      const output = Arr.partition(arr, Fun.constant(true));
      Assert.eq('eq', 0, output.fail.length);
      Assert.eq('eq', arr, output.pass);
    }
  ));
});

UnitTest.test('Check that everything in fail fails predicate and everything in pass passes predicate', () => {
  fc.assert(fc.property(
    fc.array(fc.integer()),
    (arr) => {
      const predicate = (x) => x % 3 === 0;
      const output = Arr.partition(arr, predicate);
      return Arr.forall(output.fail, (x) => !predicate(x)) && Arr.forall(output.pass, predicate);
    }
  ));
});
