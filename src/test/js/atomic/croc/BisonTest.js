test(
  'BisonTest',

  [
    'ephox.compass.Arr',
    'ephox.snooker.croc.Bison',
    'ephox.snooker.croc.Spanning'
  ],

  function (Arr, Bison, Spanning) {
    var s = Spanning;

    var logger = function (data) {
      console.log('Result: ', Arr.map(data, function (row) {
        return Arr.map(row, function (cell) {
          return '(' + cell.rowspan() + ', ' + cell.colspan() + ')';
        });
      }));
    };

    var check = function (expected, input, r, c) {
      var actual = Bison.split(input, r, c);
      logger(actual);
      assert.eq(expected.length, actual.length);
      Arr.each(expected, function (exp, expi) {
        var act = actual[expi];
        assert.eq(exp.length, act.length);
        Arr.each(exp, function (e, i) {
          var a = act[i];
          assert.eq(e.rowspan(), a.rowspan());
          assert.eq(e.colspan(), a.colspan());
        });
      });
    };

    check([], [], 0, 0);
    check([
      [ s(1,1), s(1,1) ]
    ], [ [ s(1,1) ] ], 0, 0);

    check([
      [ s(1,1), s(1,1) ]
    ], [ [ s(1,2) ] ], 0, 0);

    check(
      [
        [ s(1,1), s(1,1), s(1,1) ]
      ], 
      [ 
        [ s(1,3) ]
      ]
    , 0, 0);

    check(
      [
        [ s(1,2), s(1,1), s(1,1) ]
      ],
      [
        [ s(1,2), s(1,2) ]
      ]
    , 0, 1);

    check(
      [
        [ s(1,1), s(1,1), s(1,1) ],
        [ s(1,2), s(1,1) ]
      ],
      [
        [ s(1,1), s(1,1) ],
        [ s(1,1), s(1,1) ]
      ]
    , 0, 0)
  }
);
