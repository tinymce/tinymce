test(
  'YecoTest',

  [
    'ephox.peanut.Fun',
    'ephox.snooker.croc.Spanning',
    'ephox.snooker.tbio.Yeco',
    'ephox.snooker.test.Assertions'
  ],

  function (Fun, Spanning, Yeco, Assertions) {
    var check = function (expected, method, input, cx, cy) {
      var actual = method(input, cx, cy, function () {
        return Spanning('?', 1, 1);
      });
      Assertions.assertInfo(expected, actual);
    };

    var generate = function () {
      return [
        [ Spanning('a', 1, 1), Spanning('b', 1, 1) ],
        [ Spanning('c', 1, 2) ]
      ];
    };

    check([
      [ { id: 'b', colspan: 1, rowspan: 1 } ],
      [ { id: 'c', colspan: 1, rowspan: 1 } ]
    ], Yeco.erase, generate(), 0, 0);

    check([
      [ { id: 'a', colspan: 1, rowspan: 1 } ],
      [ { id: 'c', colspan: 1, rowspan: 1 } ]
    ], Yeco.erase, generate(), 1, 0);


    check([
      [ { id: 'a', colspan: 1, rowspan: 1 }, { id: '?', colspan: 1, rowspan: 1 }, { id: 'b', colspan: 1, rowspan: 1 } ],
      [ { id: 'c', colspan: 3, rowspan: 1 } ]
    ], Yeco.insertAfter, generate(), 0, 0);

    check([
      [ { id: 'a', colspan: 1, rowspan: 1 }, { id: 'b', colspan: 1, rowspan: 1 }, { id: '?', colspan: 1, rowspan: 1 } ],
      [ { id: 'c', colspan: 2, rowspan: 1 }, { id: '?', colspan: 1, rowspan: 1 } ]
    ], Yeco.insertAfter, generate(), 1, 0);

    check([
      [ { id: '?', colspan: 1, rowspan: 1 }, { id: 'a', colspan: 1, rowspan: 1 }, { id: 'b', colspan: 1, rowspan: 1 } ],
      [ { id: '?', colspan: 1, rowspan: 1 }, { id: 'c', colspan: 2, rowspan: 1 } ]
    ], Yeco.insertBefore, generate(), 0, 0);

    check([
      [ { id: 'a', colspan: 1, rowspan: 1 }, { id: '?', colspan: 1, rowspan: 1 }, { id: 'b', colspan: 1, rowspan: 1 } ],
      [ { id: 'c', colspan: 3, rowspan: 1 } ]
    ], Yeco.insertBefore, generate(), 1, 0);


  }
);
