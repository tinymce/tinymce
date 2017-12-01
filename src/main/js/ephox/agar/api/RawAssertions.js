define(
  'ephox.agar.api.RawAssertions',

  [
    'ephox.agar.api.LegacyAssert',
    'ephox.sand.api.JSON'
  ],

  function (LegacyAssert, Json) {
    var stringify = function (v) {
      try {
        return Json.stringify(v, null, 2);
      } catch (_) {
        return v;
      }
    };

    var extra = function (expected, actual) {
      return '.\n  Expected: ' + stringify(expected) + '\n  Actual: ' + stringify(actual);
    };

    var assertEq = function (label, expected, actual) {
      if (expected !== actual) LegacyAssert.eq(expected, actual, label + extra(expected, actual));
    };

    return {
      assertEq: assertEq
    };
  }
);