test(
  'EachTest',

  [
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Obj'
  ],

  function (Arr, Obj) {
    var check = function (expected, C, input) {
      var values = [];
      C.each(input, function (x, i) {
        values.push({index: i, value: x});
      });
      assert.eq(expected, values);
    };

    var checkA = function (expected, input) {
      check(expected, Arr, input);
    };

    var checkO = function (expected, input) {
      check(expected, Obj, input);
    };

    checkA([], []);
    checkA([{index: 0, value: 1}], [1]);
    checkA([{index: 0, value: 2}, {index: 1, value: 3}, {index: 2, value: 5}], [2, 3, 5]);

    checkO([], {});
    checkO([{index: 'a', value: 'A'}], {a: 'A'});
    checkO([{index: 'a', value: 'A'}, {index: 'b', value: 'B'}, {index: 'c', value: 'C'}], {a: 'A', b: 'B', c: 'C'});
  }
);
