test(
  'KeyValuesTest',

  [
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Obj',
    'ephox.wrap.Jsc'
  ],

  function (Arr, Obj, Jsc) {
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

    Jsc.property(
      'Obj.keys(input) are all in input and hasOwnProperty',
      Jsc.dict(Jsc.json),
      function (obj) {
        var keys = Obj.keys(obj);
        return Arr.forall(keys, function (k) {
          return obj.hasOwnProperty(k);
        });
      }
    );
  }
);
