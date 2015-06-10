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
        [ d('td1', 1, 3), d('td2', 1, 1), d('td3', 1, 1) ]
      ], 
      [
        [ 'td1', 'td1', 'td1', 'td2', 'td3' ]
      ]
    );

    check(
      [
        [ d('td1', 4, 3) ],
        [ ],
        [ ],
        [ ]
      ], 
      [
        [ 'td1', 'td1', 'td1' ],
        [ 'td1', 'td1', 'td1' ],
        [ 'td1', 'td1', 'td1' ],
        [ 'td1', 'td1', 'td1' ]
      ]
    );

    check(
      [
        [ d('td1', 2, 3) ],
        [ ],
      ], 
      [
        [ 'td1', 'td1', 'td1' ],
        [ 'td1', 'td1', 'td1' ]
      ]
    );

    check(
      [
        [ d('td1', 2, 2), d('td3', 1, 1) ],
        [ d('td4', 1, 1) ],
      ], 
      [
        [ 'td1', 'td1', 'td3' ],
        [ 'td1', 'td1', 'td4' ]
      ]
    );

    check(
      [
        [ d('td1', 2, 2), d('td3', 1, 1) ],
        [ d('td4', 2, 1) ],
        [ d('td2', 1, 2) ],
        [ d('td5', 1, 1), d('td6', 1, 2) ]
      ], 
      [
        [ 'td1', 'td1', 'td3' ],
        [ 'td1', 'td1', 'td4' ],
        [ 'td2', 'td2', 'td4' ],
        [ 'td5', 'td6', 'td6' ]
      ]
    );
  }
);