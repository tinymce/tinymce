test(
  'TableCounterTest',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.snooker.api.Structs',
    'ephox.snooker.model.Transitions'
  ],

  function (Arr, Fun, Structs, Transitions) {

    var d = Structs.detail;
    var r = Structs.rowcells;
    var rd = Structs.rowdetails;

    var check = function (expected, input) {
      var actual = Transitions.toDetails(input, Fun.tripleEquals);
      var cleaner = function (obj) {
        return Arr.map(obj, function (row) {
          return Arr.map(row, function (c) {
            return { element: c.element(), rowspan: c.rowspan(), colspan: c.colspan() };
          });
        });
      };
      assert.eq(cleaner(expected), cleaner(actual));
    };

    check(
      [
        rd([ d('td1', 1, 3), d('td2', 1, 1), d('td3', 1, 1) ], 'tbody')
      ], 
      [
        r([ 'td1', 'td1', 'td1', 'td2', 'td3' ], 'tbody')
      ]
    );

    check(
      [
        rd([ d('td1', 1, 3), d('td2', 1, 1), d('td3', 1, 1) ], 'thead')
      ], 
      [
        r([ 'td1', 'td1', 'td1', 'td2', 'td3' ], 'thead')
      ]
    );

    check(
      [
        rd([ d('td1', 4, 3) ], 'tbody'),
        rd([ ], 'tbody'),
        rd([ ], 'tbody'),
        rd([ ], 'tbody')
      ], 
      [
        r([ 'td1', 'td1', 'td1' ], 'tbody'),
        r([ 'td1', 'td1', 'td1' ], 'tbody'),
        r([ 'td1', 'td1', 'td1' ], 'tbody'),
        r([ 'td1', 'td1', 'td1' ], 'tbody')
      ]
    );

    check(
      [
        rd([ d('td1', 4, 3) ], 'tfoot'),
        rd([ ], 'tfoot'),
        rd([ ], 'tfoot'),
        rd([ ], 'tfoot')
      ], 
      [
        r([ 'td1', 'td1', 'td1' ], 'tfoot'),
        r([ 'td1', 'td1', 'td1' ], 'tfoot'),
        r([ 'td1', 'td1', 'td1' ], 'tfoot'),
        r([ 'td1', 'td1', 'td1' ], 'tfoot')
      ]
    );

    check(
      [
        rd([ d('td1', 2, 3) ], 'tbody'),
        rd([ ], 'tbody')
      ], 
      [
        r([ 'td1', 'td1', 'td1' ], 'tbody'),
        r([ 'td1', 'td1', 'td1' ], 'tbody')
      ]
    );

    check(
      [
        rd([ d('td1', 1, 1) ], 'thead'),
        rd([ d('td2', 1, 1) ], 'tbody'),
        rd([ d('td3', 1, 1) ], 'tfoot')
      ], 
      [
        r([ 'td1' ], 'thead'),
        r([ 'td2' ], 'tbody'),
        r([ 'td3' ], 'tfoot')
      ]
    );

    check(
      [
        rd([ d('td1', 2, 2), d('td3', 1, 1) ], 'tbody'),
        rd([ d('td4', 1, 1) ], 'tbody')
      ], 
      [
        r([ 'td1', 'td1', 'td3' ], 'tbody'),
        r([ 'td1', 'td1', 'td4' ], 'tbody')
      ]
    );

    check(
      [
        rd([ d('td1', 2, 2), d('td3', 1, 1) ], 'tbody'),
        rd([ d('td4', 2, 1) ], 'tbody'),
        rd([ d('td2', 1, 2) ], 'tbody'),
        rd([ d('td5', 1, 1), d('td6', 1, 2) ], 'tbody')
      ], 
      [
        r([ 'td1', 'td1', 'td3' ], 'tbody'),
        r([ 'td1', 'td1', 'td4' ], 'tbody'),
        r([ 'td2', 'td2', 'td4' ], 'tbody'),
        r([ 'td5', 'td6', 'td6' ], 'tbody')
      ]
    );
  }
);