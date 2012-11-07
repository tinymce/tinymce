define(
  'ephox.robin.test.Assertions',

  [
  ],

  function () {

    var assertOpt = function (o1, o2) {
      o1.fold(function () {
        assert.eq(true, o2.isNone());
      }, function (v) {
        o2.fold(function () {
          assert.fail('Expected some, was none.' + JSON.stringify(v));
        }, function (vv) {
          assert.eq(v, vv);
        });
      });
    };

    return {
      assertOpt: assertOpt
    };
  }
);
