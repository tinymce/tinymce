define(
  'ephox.snooker.test.Assertions',

  [
    'ephox.compass.Arr'
  ],

  function (Arr) {
    var assertInfo = function (expected, actual) {
      var cleaner = Arr.map(actual, function (row) {
        var cells = Arr.map(row.cells(), function (c) {
          return { element: c.element(), rowspan: c.rowspan(), colspan: c.colspan() };
        });
      });

      assert.eq(expected, cleaner);
    };

    return {
      assertInfo: assertInfo
    };
  }
);
