test(
  'BiFilterTest',

  [
    'ephox.katamari.api.Obj'
  ],

  function (Obj) {
    var even = function (x) {
      return x % 2 === 0;
    };

    var check = function (trueObj, falseObj, input, f) {
      var filtered = Obj.bifilter(input, f);
      assert.eq(trueObj, filtered.t);
      assert.eq(falseObj, filtered.f);
    };

    check({}, {a: '1'}, {a: '1'}, even);
    check({b: '2'}, {}, {b: '2'}, even);
    check({b: '2'}, {a: '1'}, {a: '1', b: '2'}, even);
    check({b: '2', d: '4'}, {a: '1', c: '3'}, {a: '1', b: '2', c: '3', d: '4'}, even);
  }
);
