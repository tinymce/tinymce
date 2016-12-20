define(
  'ephox.agar.api.RawAssertions',

  [
    'ephox.sand.api.JSON'
  ],

  function (Json) {
    // This is used in atomic tests. It does not require a DOM. It does require bolt.
    var assertEq = function (label, a, b) {
      var stringify = function (v) {
        try {
          return Json.stringify(v, null, 2);
        } catch (_) {
          return v;
        }
      };

      var extra = function () {
        return '.\n  Expected: ' + stringify(a) + '\n  Actual: ' + stringify(b);
      };
      
      assert.eq(a, b, '[Equality]: ' + label + extra());
    };

    return {
      assertEq: assertEq
    };
  }
);