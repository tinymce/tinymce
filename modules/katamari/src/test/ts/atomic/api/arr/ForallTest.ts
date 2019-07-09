import * as Arr from 'ephox/katamari/api/Arr';
import * as Fun from 'ephox/katamari/api/Fun';
import Jsc from '@ephox/wrap-jsverify';
import { UnitTest, assert } from '@ephox/bedrock';

UnitTest.test('ForallTest', function () {
  const isone = function (i) {
    return i === 1;
  };

  const check = function (expected, input, f) {
    assert.eq(expected, Arr.forall(input, f));
    assert.eq(expected, Arr.forall(Object.freeze(input.slice()), f));
  };

  check(true, [1, 1, 1], isone);
  check(false, [1, 2, 1], isone);

  check(false, [1, 2, 1], function (x, i) {
    return i === 0;
  });

  check(true, [1, 12, 3], function (x, i) {
    return i < 10;
  });

  Jsc.property(
    'forall of an empty array is true',
    Jsc.fun(Jsc.bool),
    function (pred) {
      const output = Arr.forall([ ], pred);
      return Jsc.eq(true, output);
    }
  );

  Jsc.property(
    'forall of a non-empty array with a predicate that always returns false is false',
    Jsc.nearray(Jsc.json),
    function (xs) {
      const output = Arr.forall(xs, Fun.constant(false));
      return Jsc.eq(false, output);
    }
  );

  Jsc.property(
    'forall of a non-empty array with a predicate that always returns true is true',
    Jsc.nearray(Jsc.json),
    function (xs) {
      const output = Arr.forall(xs, Fun.constant(true));
      return Jsc.eq(true, output);
    }
  );

  Jsc.property(
    'forall of an array = true if filter(array).length = array.length',
    Jsc.array(Jsc.json),
    Jsc.fun(Jsc.bool),
    function (xs, g) {
      const output = Arr.forall(xs, g);
      const filtered = Arr.filter(xs, g);
      return output === true ? Jsc.eq(filtered.length, xs.length) : filtered.length < xs.length;
    }
  );
});
