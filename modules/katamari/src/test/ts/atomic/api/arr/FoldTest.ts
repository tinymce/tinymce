import * as Arr from 'ephox/katamari/api/Arr';
import Jsc from '@ephox/wrap-jsverify';
import { UnitTest, assert } from '@ephox/bedrock';

UnitTest.test('FoldTest', function() {
  const checkl = function (expected, input: any[], f, acc) {
    assert.eq(expected, Arr.foldl(input, f, acc));
    assert.eq(expected, Arr.foldl(Object.freeze(input.slice()), f, acc));
  };

  const checkr = function (expected, input, f, acc) {
    assert.eq(expected, Arr.foldr(input, f, acc));
    assert.eq(expected, Arr.foldr(Object.freeze(input.slice()), f, acc));
  };

  checkl(0, [], function () { }, 0);
  checkl(6, [1, 2, 3], function (acc, x) { return acc + x; }, 0);
  checkl(13, [1, 2, 3], function (acc, x) { return acc + x; }, 7);
  // foldl with cons and [] should reverse the list
  checkl([3, 2, 1], [1, 2, 3], function (acc, x) { return [x].concat(acc); }, []);

  checkr(0, [], function () { }, 0);
  checkr(6, [1, 2, 3], function (acc, x) { return acc + x; }, 0);
  checkr(13, [1, 2, 3], function (acc, x) { return acc + x; }, 7);
  // foldr with cons and [] should be identity
  checkr([1, 2, 3], [1, 2, 3], function (acc, x) { return [x].concat(acc); }, []);

  Jsc.property(
    'foldl concat [ ] xs === reverse(xs)',
    Jsc.array(Jsc.json),
    function (arr) {
      const output = Arr.foldl(arr, function (b, a) {
        return [ a ].concat(b);
      }, [ ]);
      return Jsc.eq(Arr.reverse(arr), output);
    }
  );

  Jsc.property(
    'foldr concat [ ] xs === xs',
    Jsc.array(Jsc.json),
    function (arr) {
      const output = Arr.foldr(arr, function (b, a) {
        return [ a ].concat(b);
      }, [ ]);
      return Jsc.eq(arr, output);
    }
  );

  Jsc.property(
    'foldr concat ys xs === xs ++ ys',
    Jsc.array(Jsc.json),
    Jsc.array(Jsc.json),
    function (xs, ys) {
      const output = Arr.foldr(xs, function (b, a) {
        return [ a ].concat(b);
      }, ys);
      return Jsc.eq(xs.concat(ys), output);
    }
  );

  Jsc.property(
    'foldl concat ys xs === reverse(xs) ++ ys',
    Jsc.array(Jsc.json),
    Jsc.array(Jsc.json),
    function (xs, ys) {
      const output = Arr.foldl(xs, function (b, a) {
        return [ a ].concat(b);
      }, ys);
      return Jsc.eq(Arr.reverse(xs).concat(ys), output);
    }
  );
});

