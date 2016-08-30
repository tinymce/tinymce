test(
  'ObjMapTest',

  [
    'ephox.katamari.api.Obj'
  ],

  function (Obj) {
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
  
    var checkO = function (expected, input, f) {
      check(expected, Obj, input, f);
    };

    var checkT = function (expected, input, f) {
      assert.eq(expected, Obj.tupleMap(input, f));
    };

    checkO({}, {}, dbl);
    checkO({a: 'a.'}, {a: 'a'}, addDot);
    checkO({a: 'a.', b: 'b.', c: 'c.'}, {a: 'a', b: 'b', c: 'c'}, addDot);

    checkT({}, {}, tupleF);
    checkT({ab:'ab'}, {a:'a'}, tupleF);
    checkT({ab:'ab', bb:'bb', cb:'cb'}, {a:'a', b:'b', c:'c'}, tupleF);
  }
);
