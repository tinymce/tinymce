test(
  'LeadTest',

  [
    'ephox.peanut.Fun',
    'ephox.scullion.Struct',
    'ephox.snooker.model.Lead'
  ],

  function (Fun, Struct, Lead) {

    var inputRangeStruct = Struct.immutableBag([ 'startCol', 'startRow', 'endCol', 'endRow' ], []);

    var check = function (expected, actual) {
      assert.eq(expected.element(), actual.element());
      assert.eq(expected.rowspan(), actual.rowspan());
      assert.eq(expected.colspan(), actual.colspan());
    };

    var expectA = {
      element: Fun.constant('td'),
      colspan: Fun.constant(3),
      rowspan: Fun.constant(1)
    };

    var testRangeA = inputRangeStruct({
      startCol: 0,
      startRow: 0,
      endCol: 2,
      endRow: 0
    });

    var leaderA = Lead.generate('td', testRangeA);
    check(expectA, leaderA);

    var expectB = {
      element: Fun.constant('td'),
      colspan: Fun.constant(3),
      rowspan: Fun.constant(3)
    };

    var testRangeB = inputRangeStruct({
      startCol: 0,
      startRow: 0,
      endCol: 2,
      endRow: 2
    });

    var leaderB = Lead.generate('td', testRangeB);
    check(expectB, leaderB);


  }
);