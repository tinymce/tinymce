test(
  'MapTest',

  [
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Obj'
  ],

  function (Arr, Obj) {
    var dbl = function (x) {
      return x * 2;
    };

    var addDot = function (x) {
      return x + '.';
    };

    var tupleF = function (x, i) {
      return {
        k: i + 'b',
        v: x + 'b'
      };
    };

    var check = function (expected, C, input, f) {
      assert.eq(expected, C.map(input, f));
    };

    var checkA = function (expected, input, f) {
      check(expected, Arr, input, f);
    };

    var checkO = function (expected, input, f) {
      check(expected, Obj, input, f);
    };

    var checkT = function (expected, input, f) {
      assert.eq(expected, Obj.tupleMap(input, f));
    };

    checkA([], [], dbl);
    checkA([2], [1], dbl);
    checkA([4, 6, 10], [2, 3, 5], dbl);
    
    checkO({}, {}, dbl);
    checkO({a: 'a.'}, {a: 'a'}, addDot);
    checkO({a: 'a.', b: 'b.', c: 'c.'}, {a: 'a', b: 'b', c: 'c'}, addDot);

    checkT({}, {}, tupleF);
    checkT({ab:'ab'}, {a:'a'}, tupleF);
    checkT({ab:'ab', bb:'bb', cb:'cb'}, {a:'a', b:'b', c:'c'}, tupleF);
  }
);
