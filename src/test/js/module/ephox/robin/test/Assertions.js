define(
  'ephox.robin.test.Assertions',

  [
    'ephox.compass.Arr',
    'ephox.wrap.Json'
  ],

  function (Arr, Json) {

    var assertOpt = function (o1, o2) {
      assertOptComp(o1, o2, function (a, b) {
        assert.eq(a, b);
      });
    };

    var assertOptTextList = function (o1, o2) {
      assertOptComp(o1, o2, function (a, b) {
        assert.eq(a.length,  b.length);
        Arr.each(a, function (x, i) {
          assert.eq(a[i], b[i].text());
        });
      });
    };

    var assertOptComp = function (o1, o2, f) {
      o1.fold(function () {
        assert.eq(true, o2.isNone());
      }, function (v) {
        o2.fold(function () {
          assert.fail('Expected some, was none. ' + Json.stringify(v));
        }, function (vv) {
          f(v, vv);
        });
      });
    };

    return {
      assertOpt: assertOpt,
      assertOptTextList: assertOptTextList,
      assertOptComp: assertOptComp
    };
  }
);
