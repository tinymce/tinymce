import * as Arr from 'ephox/katamari/api/Arr';
import * as Fun from 'ephox/katamari/api/Fun';
import Jsc from '@ephox/wrap-jsverify';
import { UnitTest, assert } from '@ephox/bedrock';

UnitTest.test('Partition Test', function() {
  (function() {

    const check = function (input: any[], expected) {
      const f = function (n) { return n.indexOf('yes') > -1; };
      assert.eq(expected, Arr.partition(input, f));
      assert.eq(expected, Arr.partition(Object.freeze(input.slice()), f));
    };

    check([], {pass: [], fail:[]});
    check(['yes'], {pass: ['yes'], fail:[]});
    check(['no'], {pass: [], fail:['no']});
    check(
      ['yes', 'no', 'no', 'yes'],
      {
        pass: ['yes', 'yes'], fail: ['no', 'no']
      }
    );

    check(
      ['no 1', 'no 2', 'yes 1', 'yes 2', 'yes 3', 'no 3', 'no 4', 'yes 4', 'no 5', 'yes 5'],
      {
        pass: ['yes 1', 'yes 2', 'yes 3', 'yes 4', 'yes 5'], fail: ['no 1', 'no 2', 'no 3', 'no 4', 'no 5']
      }
    );

    Jsc.property(
      'Check that if the filter always returns false, then everything is in "fail"',
      Jsc.array(Jsc.json),
      function (arr) {
        const output = Arr.partition(arr, Fun.constant(false));
        return Jsc.eq(0, output.pass.length) && Jsc.eq(arr, output.fail);
      }
    );

    Jsc.property(
      'Check that if the filter always returns true, then everything is in "pass"',
      Jsc.array(Jsc.json),
      function (arr) {
        const output = Arr.partition(arr, Fun.constant(true));
        return Jsc.eq(0, output.fail.length) && Jsc.eq(arr, output.pass);
      }
    );
 
    Jsc.property(
      'Check that everything in fail fails predicate and everything in pass passes predicate',
      Jsc.array(Jsc.json),
      Jsc.fun(Jsc.bool),
      function (arr, predicate) {
        const output = Arr.partition(arr, predicate);

        return Arr.forall(output.fail, function (x) {
          return predicate(x) === false;
        }) && Arr.forall(output.pass, function (x) {
          return predicate(x) === true;
        });
      }
    );
  })();
});

