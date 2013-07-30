test(
  'BisonTest',

  [
    'ephox.compass.Arr',
    'ephox.compass.Obj',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.snooker.croc.Bison',
    'ephox.snooker.croc.Spanning'
  ],

  function (Arr, Obj, Fun, Option, Bison, Spanning) {
    var s = Spanning;
    var some = Option.some;
    var none = Option.none;

    var logger = function (data) {
      console.log('Result: ', Arr.map(data, function (row) {
        return Arr.map(row, function (cell) {
          return '(' + cell.rowspan() + ', ' + cell.colspan() + ')';
        });
      }));
    };

    var asserter = function (expected, actual) {
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

    var checkV = function (expected, input, c) {
      console.log('doing a check', c);
      var actual = Bison.voom(input, c);
      assert.eq(expected.length, actual.length);
      Arr.each(expected, function (e, i) {
        var a = actual[i];
        assert.eq(e[0], Arr.map(a.before(), function (x) { return x.id(); }));
        a.on().fold(function () {
          assert.eq(true, e[1].isNone());
        }, function (v) {
          e[1].fold(function () {
            assert.fail('expected none, was: ' + v.id());
          }, function (vv) {
            assert.eq(vv, v.id());
          });
        });
        assert.eq(e[2], Arr.map(a.after(), function (x) { return x.id(); }));
      });
    };

    var checkX = function (expected, input) {
      var actual = Bison.stomp(input);
      assert.eq(expected, Obj.map(actual, function (x) { return x.id(); }));
    };

    var testTable = [
      [ s('a', 1,2), s('b',1,1), s('c',1,1), s('d',1,1), s('e',1,1), s('f',1,1) ],
      [ s('g',1,1), s('h',1,1), s('i',1,1), s('j',1,1), s('k',1,3) ],
      [ s('l',1,1), s('m',3,2), s('n',1,1), s('o',1,1), s('p',1,1), s('q',1,1) ],
      [ s('r',2,1), s('s',1,1), s('t',2,1), s('u',1,1), s('v',1,1) ],
      [ s('w',1,1), s('x',1,1), s('y',1,1) ]
    ];

    checkX({
      '0,0': 'a',
      '0,1': 'a',
      '0,2': 'b',
      '0,3': 'c',
      '0,4': 'd',
      '0,5': 'e',
      '0,6': 'f',
      '1,0': 'g',
      '1,1': 'h',
      '1,2': 'i',
      '1,3': 'j',
      '1,4': 'k',
      '1,5': 'k',
      '1,6': 'k',
      '2,0': 'l',
      '2,1': 'm',
      '2,2': 'm',
      '2,3': 'n',
      '2,4': 'o',
      '2,5': 'p',
      '2,6': 'q',
      '3,0': 'r',
      '3,1': 'm',
      '3,2': 'm',
      '3,3': 's',
      '3,4': 't',
      '3,5': 'u',
      '3,6': 'v',
      '4,0': 'r',
      '4,1': 'm',
      '4,2': 'm',
      '4,3': 'w',
      '4,4': 't',
      '4,5': 'x',
      '4,6': 'y'
    }, testTable);

    checkV([
      [ [], some('a'), [ 'b', 'c', 'd', 'e', 'f' ] ],
      [ [], some('g'), [ 'h', 'i', 'j', 'k' ] ],
      [ [], some('l'), [ 'm', 'n', 'o', 'p', 'q' ] ],
      [ [], some('r'), [ 's', 't', 'u', 'v' ] ],
      [ [], none(), [ 'w', 'x', 'y' ] ]
    ], testTable, 0);

    checkV([
      [ [], some('a'), [ 'b', 'c', 'd', 'e', 'f' ] ],
      [ ['g'], some('h'), [ 'i', 'j', 'k' ] ],
      [ ['l'], some('m'), [ 'n', 'o', 'p', 'q' ] ],
      [ ['r'], none(), [ 's', 't', 'u', 'v' ] ],
      [ [], none(), [ 'w', 'x', 'y' ] ]
    ], testTable, 1);

    checkV([
      [ ['a'], some('b'), [ 'c', 'd', 'e', 'f' ] ],
      [ ['g', 'h'], some('i'), [ 'j', 'k' ] ],
      [ ['l'], some('m'), [ 'n', 'o', 'p', 'q' ] ],
      [ ['r'], none(), [ 's', 't', 'u', 'v' ] ],
      [ [], none(), [ 'w', 'x', 'y' ] ]
    ], testTable, 2);

    checkV([
      [ [ 'a', 'b' ], some('c'), [ 'd', 'e', 'f' ] ],
      [ [ 'g', 'h', 'i' ], some('j'), [ 'k' ] ],
      [ [ 'l', 'm' ], some('n'), [ 'o', 'p', 'q' ] ],
      [ [ 'r' ], some('s'), [ 't', 'u', 'v' ] ],
      [ [], some('w'), [ 'x', 'y' ] ]
    ], testTable, 3);

    checkV([
      [ [ 'a', 'b', 'c' ], some('d'), [ 'e', 'f' ] ],
      [ [ 'g', 'h', 'i', 'j' ], some('k'), [] ],
      [ [ 'l', 'm', 'n' ], some('o'), [ 'p', 'q' ] ],
      [ [ 'r', 's' ], some('t'), [ 'u', 'v' ] ],
      [ [ 'w' ], none(), [ 'x', 'y' ] ]
    ], testTable, 4)

    checkV([
      [ [ 'a', 'b', 'c', 'd' ], some('e'), [ 'f' ] ],
      [ [ 'g', 'h', 'i', 'j' ], some('k'), [] ],
      [ [ 'l', 'm', 'n', 'o' ], some('p'), ['q'] ],
      [ [ 'r', 's', 't' ], some('u'), [ 'v' ] ],
      [ [ 'w' ], some('x'), [ 'y' ] ]
    ], testTable, 5);

    checkV([
      [ [ 'a', 'b', 'c', 'd', 'e' ], some('f'), [] ],
      [ [ 'g', 'h', 'i', 'j' ], some('k'), [] ],
      [ [ 'l', 'm', 'n', 'o', 'p' ], some('q'), [] ],
      [ [ 'r', 's', 't', 'u' ], some('v'), [] ],
      [ [ 'w', 'x' ], some('y'), [ ] ]
    ], testTable, 6);

    var check = function (expected, input, r, c) {
      var actual = Bison.split(input, r, c);
      asserter(expected, actual);
    };

    check([], [], 0, 0);
    check([
      [ s('a',1,1), s('b',1,1) ]
    ], [ [ s('c',1,1) ] ], 0, 0);

    check([
      [ s('a',1,1), s('b',1,1) ]
    ], [ [ s('c',1,2) ] ], 0, 0);

    check(
      [
        [ s('a',1,1), s('b',1,1), s('c',1,1) ]
      ], 
      [ 
        [ s('d',1,3) ]
      ]
    , 0, 0);

    check(
      [
        [ s('a',1,2), s('b',1,1), s('c',1,1) ]
      ],
      [
        [ s('d',1,2), s('e',1,2) ]
      ]
    , 0, 1);

    check(
      [
        [ s('a',1,1), s('b',1,1), s('c',1,1) ],
        [ s('d',1,2), s('e',1,1) ]
      ],
      [
        [ s('f',1,1), s('g',1,1) ],
        [ s('h',1,1), s('h',1,1) ]
      ]
    , 0, 0);

    var testTable2 = [
      [ s('a', 1,2), s('b',1,1) ],
      [ s('g',1,1), s('h',1,1), s('i',1,1) ],
      [ s('l',1,1), s('m',3,2) ],
      [ s('r',2,1) ],
      [  ]
    ];

    check(
      [
        [ s('a',1,1), s('a+',1,1), s('b',1,1) ],
        [ s('g',1,1), s('h',1,1), s('i',1,1) ],
        [ s('l',1,1), s('m',3,2) ],
        [ s('r',2,1) ],
        [ ]
      ],
    testTable2, 0, 0);

    check(
      [
        [ s('a',1,2), s('b',1,1), s('b+',1,1) ],
        [ s('g',1,1), s('h',1,1), s('i',1,2) ],
        [ s('l',1,1), s('m',3,3) ],
        [ s('r',2,1) ],
        [ ]
      ],
    testTable2, 0, 1);

    check(
      [
        [ s('a',1,2), s('b',1,1) ],
        [ s('g',1,1), s('h',1,1), s('i',1,1) ],
        [ s('l',1,1), s('m',1,1), s('m2',1,1) ],
        [ s('r',2,1), s('m3',1,1), s('m4',1,1) ],
        [ s('m5',1,1), s('m6',1,1) ]
      ],
    testTable2, 2, 1);

    check(
      [
        [ s('a', 1,2), s('b',1,1) ],
        [ s('g',1,1), s('h',1,1), s('i',1,1) ],
        [ s('l',1,1), s('m',3,2) ],
        [ s('r',1,1) ],
        [ s('r2',1,1) ]
      ],
    testTable2, 3, 0);
  }
);
