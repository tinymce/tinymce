import * as Arr from 'ephox/katamari/api/Arr';
import * as Fun from 'ephox/katamari/api/Fun';
import Jsc from '@ephox/wrap-jsverify';
import { UnitTest, assert } from '@ephox/bedrock';

UnitTest.test('BindTest', function () {
  const len = function (x) {
    return [x.length];
  };

  const check = function (expected, input: any[], f) {
    assert.eq(expected, Arr.bind(input, f));
    assert.eq(expected, Arr.bind(Object.freeze(input.slice()), f));
  };

  check([], [], len);
  check([1], [[1]], len);
  check([1, 1], [[1], [2]], len);
  check([2, 0, 1, 2, 0], [[1, 2], [], [3], [4, 5], []], len);

  Jsc.property(
    'Check Arr.bind(xs, _ -> [_] eq xs',
    Jsc.array(Jsc.json),
    function (arr: any[]) {
      const output = Arr.bind(arr, Arr.pure);
      return Jsc.eq(output, arr);
    }
  );

  Jsc.property(
    'Check binding an array of empty arrays with identity equals an empty array',
    Jsc.array(Jsc.constant([])),
    function (arr: any[]) {
      const output = Arr.bind(arr, Fun.identity);
      return Jsc.eq([ ], output);
    }
  );

  Jsc.property(
    'Bind with identity is symmetric with chunking',
    Jsc.array(Jsc.json),
    Jsc.integer(1, 5),
    function (arr: any[], chunkSize: number) {
      const chunks = Arr.chunk(arr, chunkSize);
      const bound = Arr.bind(chunks, Fun.identity);
      return Jsc.eq(arr, bound);
    }
  );

  Jsc.property(
    'Bind with pure is the same as map',
    Jsc.array(Jsc.json),
    Jsc.fun(Jsc.json),
    function (arr: any[], g: (x: any) => any) {
      const bound = Arr.bind(arr, Fun.compose(Arr.pure, g));
      const mapped = Arr.map(arr, g);
      return Jsc.eq(mapped, bound);
    }
  );
});
