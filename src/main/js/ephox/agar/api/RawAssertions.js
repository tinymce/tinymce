define(
  'ephox.agar.api.RawAssertions',

  [
    'ephox.sand.api.JSON'
  ],

  function (Json) {
    var stringify = function (v) {
      try {
        return Json.stringify(v);
      } catch (_) {
        return v;
      }
    };

    var extra = function (a, b) {
      return '.\n  Expected: ' + stringify(a) + '\n  Actual: ' + stringify(b);
    };

    // This is used in atomic tests. It does not require a DOM. It does require bolt.
    var assertEq = function (label, a, b) {
      assert.eq(a, b, '[Equality]: ' + label + extra(a, b));
    };


    var windowAssertEq = function (label, a, b) {
      if (window.assertEq) window.assertEq(a, b, label + extra(a, b));
      else if (window.assert && window.assert.eq) window.assert.eq(a, b, label + extra(a, b));
      else if (a !== b) throw new Error('[Equality]: ' + label + extra(a, b));
    };

    return {
      assertEq: assertEq,
      windowAssertEq: windowAssertEq
    };
  }
);