import * as Arr from 'ephox/katamari/api/Arr';
import Jsc from '@ephox/wrap-jsverify';
import { UnitTest, assert } from '@ephox/bedrock';

UnitTest.test('ArrEachTest', function() {
  const checkLHelper = function (expected, input) {
    const values = [];
    Arr.each(input, function (x, i) {
      values.push({index: i, value: x});
    });
    assert.eq(expected, values);
  };

  const checkL = function(expected, input: any[]) {
    checkLHelper(expected, input);
    checkLHelper(expected, Object.freeze(input.slice()));
  };

  const checkRHelper = function (expected, input) {
    const values = [];
    Arr.eachr(input, function (x, i) {
      values.push({index: i, value: x});
    });
    assert.eq(expected, values);
  };

  const checkR = function(expected, input: any[]) {
    checkRHelper(expected, input);
    checkRHelper(expected, Object.freeze(input.slice()));
  };

  checkL([], []);
  checkL([{index: 0, value: 1}], [1]);
  checkL([{index: 0, value: 2}, {index: 1, value: 3}, {index: 2, value: 5}], [2, 3, 5]);

  checkR([{index: 2, value: 2}, {index: 1, value: 3}, {index: 0, value: 5}], [5, 3, 2]);

  Jsc.property(
    'Each + push should equal the same array',
    Jsc.array(Jsc.json),
    function (arr) {
      const values = [ ];
      const output = Arr.each(arr, function (x, i) {
        values.push(x);
      });
      return Jsc.eq(arr, values) && Jsc.eq(undefined, output);
    }
  );

  Jsc.property(
    'eachr + push should equal the reverse of the array',
    Jsc.array(Jsc.json),
    function (arr) {
      const values = [ ];
      const output = Arr.eachr(arr, function (x, i) {
        values.push(x);
      });
      return Jsc.eq(arr, Arr.reverse(values)) && Jsc.eq(undefined, output);
    }
  );
});

