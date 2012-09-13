test(
  'PositionArray',

  [
    'ephox.perhaps.Option',
    'ephox.phoenix.util.arr.PositionArray',
    'ephox.scullion.Struct'
  ],

  function (Option, PositionArray, Struct) {

    var Tester = Struct.immutable('data', 'start', 'finish');

    var check = function (expected, input, gen, offset) {
      var list = PositionArray.make(input, gen);

      var actual = PositionArray.getAt(list, offset);
      expected.fold(function () {
        assert.eq(true, actual.isNone());
      }, function (v) {
        assert.eq(v, actual.getOrDie().data());
      });
    };

    var gen = function (a, start) {
      return Option.some(Tester(a, start, a.length + start));
    };

    check(Option.none(), [], gen, 0);
    check(Option.some('a'), ['a'], gen, 0);
    check(Option.some('a'), ['a'], gen, 1);
    check(Option.none(), ['a'], gen, 2);
    check(Option.some('cat'), ['this', 'was', 'a', 'cat', 'today', 'and', 'tomorrow'], gen, 10);
    check(Option.some('tomorrow'), ['this', 'was', 'a', 'cat', 'today', 'and', 'tomorrow'], gen, 26);
    check(Option.none(), ['this', 'was', 'a', 'cat', 'today', 'and', 'tomorrow'], gen, 28);

  }
);
