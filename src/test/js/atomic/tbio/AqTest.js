test(
  'AqTest',

  [
    'ephox.compass.Arr',
    'ephox.snooker.croc.Spanning',
    'ephox.snooker.tbio.Aq'
  ],

  function (Arr, Spanning, Aq) {
    Aq.aq([], []);

    var check = function (expected, input, widths) {
      var actual = Aq.aq(input, widths);
      console.log('actual: ', actual);
      assert.eq(expected, Arr.map(actual, function (cell) {
        return {
          id: cell.id(),
          width: cell.width()
        };
      }));
    };

    check([{ id: 'a', width: 10 }], [
      [ Spanning('a', 1, 1) ],
    ], [10]);

    check([
      { id: 'g', width: 10 }, { id: 'h', width: 10 }, { id: 'i', width: 10 }, { id: 'j', width: 10 }, { id: 'k', width: 30 },
      { id: 'l', width: 10 }, { id: 'm', width: 20 }, { id: 'n', width: 10 }, { id: 'o', width: 10 }, { id: 'p', width: 10 },
      { id: 'q', width: 10 }, { id: 'r', width: 10 }, { id: 's', width: 10 }, { id: 't', width: 10 }, { id: 'u', width: 10 }, { id: 'v', width: 10 }
    ], [
      [ Spanning('g',1,1), Spanning('h',1,1), Spanning('i',1,1), Spanning('j',1,1), Spanning('k',1,3) ],
      [ Spanning('l',1,1), Spanning('m',3,2), Spanning('n',1,1), Spanning('o',1,1), Spanning('p',1,1), Spanning('q',1,1) ],
      [ Spanning('r',2,1), Spanning('s',1,1), Spanning('t',2,1), Spanning('u',1,1), Spanning('v',1,1) ]
    ], [ 10, 10, 10, 10, 10, 10, 10 ]);
  }
);
