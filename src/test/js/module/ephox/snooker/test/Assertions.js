define(
  'ephox.snooker.test.Assertions',

  [
    'ephox.compass.Arr'
  ],

  function (Arr) {
    var assertInfo = function (expected, actual) {
      var cleaner = Arr.map(actual, function (row) {
        return Arr.map(row, function (c) {
          return { id: c.id(), rowspan: c.rowspan(), colspan: c.colspan() };
        });
      });

      assert.eq(expected, cleaner);
    };

    return {
      assertInfo: assertInfo
    };
  }
);
