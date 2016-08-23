test(
  'KeyValuesTest',

  [
    'ephox.katamari.api.Obj'
  ],

  function (Obj) {
    var check = function(expKeys, expValues, input) {
      var c = function(expected, v) {
        v.sort();
        assert.eq(expected, v);
      };

      c(expKeys, Obj.keys(input));
      c(expValues, Obj.values(input));
    };

    check([], [], {});
    check(['a'], ['A'], {a: 'A'});
    check(['a', 'b', 'c'], ['A', 'B', 'C'], {a: 'A', c: 'C', b: 'B'});
  }
);
