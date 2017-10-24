define(
  'ephox.agar.api.RawAssertions',

  [
    'ephox.katamari.api.Global',
    'ephox.sand.api.JSON'
  ],

  function (Global, Json) {
    var stringify = function (v) {
      try {
        return Json.stringify(v, null, 2);
      } catch (_) {
        return v;
      }
    };

    var extra = function (a, b) {
      return '.\n  Expected: ' + stringify(a) + '\n  Actual: ' + stringify(b);
    };

    var assertEq = function (label, a, b) {
      if (Global.assertEq) Global.assertEq(a, b, label + extra(a, b));
      else if (Global.assert && Global.assert.eq) Global.assert.eq(a, b, label + extra(a, b));
      else if (a !== b) throw new Error('[Equality]: ' + label + extra(a, b));
    };

    return {
      assertEq: assertEq
    };
  }
);