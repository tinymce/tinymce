import Arr from 'ephox/katamari/api/Arr';
import Jsc from '@ephox/wrap-jsverify';
import { UnitTest, assert } from '@ephox/refute';

UnitTest.test('ExistsTest', function() {
  var eqc = function(x) { return function(a) { return x === a; }};
  var never = function() { return false; };
  var always = function() { return true; };
  var bottom = function() { throw 'error'; };

  Jsc.property('Element appended to array exists in array', 'json', '[json]', function(i, arr) {
    var arr2 = Arr.flatten([arr, [i]]);
    return Arr.exists(arr2, eqc(i));
  });

  Jsc.property('Element exists in singleton array of itself', 'json', function(i) {
    return Arr.exists([i], eqc(i));
  });

  Jsc.property('Element does not exist in empty array', 'json', function(i) {
    return !Arr.exists([], eqc(i));
  });

  Jsc.property('Element exists in middle of array', '[json]', 'json', '[json]', function(prefix, x, suffix) {
    var arr = Arr.flatten([prefix, [x], suffix]);
    return Arr.exists(arr, eqc(x));
  });

  Jsc.property('Element not found when predicate always returns false', '[json]', function(arr) {
    return !Arr.exists(arr, never);
  });

  Jsc.property('Element does not exist in empty array even when predicate always returns true', function() {
    return !Arr.exists([], always);
  });

  Jsc.property('Element exists in non-empty array when predicate always returns true', '[json]', 'json', function(xs, x) {
    var arr = Arr.flatten([xs, [x]]);
    return Arr.exists(arr, always);
  });

  Jsc.property('Element does not exist in empty array when predicate is ⊥', function() {
    return !Arr.exists([], bottom);
  });


  var check = function (expected, input, f) {
    assert.eq(expected, Arr.exists(input, f));
  };

  check(true, [1, 2, 3], eqc(1));
  check(false, [2, 3, 4], eqc(1));
});

