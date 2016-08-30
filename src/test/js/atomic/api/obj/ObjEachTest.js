test(
  'ObjEachTest',

  [
    'ephox.katamari.api.Obj'
  ],

  function (Obj) {
    var check = function (expected, C, input) {
      var values = [];
      Obj.each(input, function (x, i) {
        values.push({index: i, value: x});
      });
      assert.eq(expected, values);
    };

    var checkO = function (expected, input) {
      check(expected, input);
    };
 
    checkO([], {});
    checkO([{index: 'a', value: 'A'}], {a: 'A'});
    checkO([{index: 'a', value: 'A'}, {index: 'b', value: 'B'}, {index: 'c', value: 'C'}], {a: 'A', b: 'B', c: 'C'});
  }
);
