import Arr from 'ephox/katamari/api/Arr';
import Fun from 'ephox/katamari/api/Fun';
import Jsc from '@ephox/wrap-jsverify';
import { UnitTest, assert } from '@ephox/refute';

UnitTest.test('BindTest', function() {
  var len = function (x) {
    return [x.length];
  };

  var check = function (expected, input, f) {
    assert.eq(expected, Arr.bind(input, f));
  };

  check([], [], len);
  check([1], [[1]], len);
  check([1, 1], [[1], [2]], len);
  check([2, 0, 1, 2, 0], [[1, 2], [], [3], [4, 5], []], len);

  Jsc.property(
    'Check Arr.bind(xs, _ -> [_] eq xs',
    Jsc.array(Jsc.json),
    function (arr) {
      var output = Arr.bind(arr, Arr.pure);
      return Jsc.eq(output, arr);
    }
  );

  Jsc.property(
    'Check binding an array of empty arrays with identity equals an empty array',
    Jsc.array(Jsc.constant([])),
    function (arr) {
      var output = Arr.bind(arr, Fun.identity);
      return Jsc.eq([ ], output);
    }
  );

  Jsc.property(
    'Bind with identity is symmetric with chunking',
    Jsc.array(Jsc.json),
    Jsc.integer(1, 5),
    function (arr, chunkSize) {
      var chunks = Arr.chunk(arr, chunkSize);
      var bound = Arr.bind(chunks, Fun.identity);
      return Jsc.eq(arr, bound);
    }
  );

  Jsc.property(
    'Bind with pure is the same as map',
    Jsc.array(Jsc.json),
    Jsc.fun(Jsc.json),
    function (arr, g) {
      var bound = Arr.bind(arr, Fun.compose(Arr.pure, g));
      var mapped = Arr.map(arr, g);
      return Jsc.eq(mapped, bound);
    }
  );
});

