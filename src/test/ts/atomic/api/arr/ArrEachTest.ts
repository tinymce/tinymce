import Arr from 'ephox/katamari/api/Arr';
import Jsc from '@ephox/wrap-jsverify';
import { UnitTest, assert } from '@ephox/refute';

UnitTest.test('ArrEachTest', function() {
  var checkL = function (expected, input) {
    var values = [];
    Arr.each(input, function (x, i) {
      values.push({index: i, value: x});
    });
    assert.eq(expected, values);
  };

  var checkR = function (expected, input) {
    var values = [];
    Arr.eachr(input, function (x, i) {
      values.push({index: i, value: x});
    });
    assert.eq(expected, values);
  };

  checkL([], []);
  checkL([{index: 0, value: 1}], [1]);
  checkL([{index: 0, value: 2}, {index: 1, value: 3}, {index: 2, value: 5}], [2, 3, 5]);

  checkR([{index: 2, value: 2}, {index: 1, value: 3}, {index: 0, value: 5}], [5, 3, 2]);

  Jsc.property(
    'Each + push should equal the same array',
    Jsc.array(Jsc.json),
    function (arr) {
      var values = [ ];
      var output = Arr.each(arr, function (x, i) {
        values.push(x);
      });
      return Jsc.eq(arr, values) && Jsc.eq(undefined, output);
    }
  );

  Jsc.property(
    'eachr + push should equal the reverse of the array',
    Jsc.array(Jsc.json),
    function (arr) {
      var values = [ ];
      var output = Arr.eachr(arr, function (x, i) {
        values.push(x);
      });
      return Jsc.eq(arr, Arr.reverse(values)) && Jsc.eq(undefined, output);
    }
  );
});

