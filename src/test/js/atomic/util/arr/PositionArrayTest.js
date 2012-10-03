test(
  'PositionArray',

  [
    'ephox.compass.Arr',
    'ephox.perhaps.Option',
    'ephox.phoenix.util.arr.PositionArray',
    'ephox.scullion.Struct'
  ],

  function (Arr, Option, PositionArray, Struct) {

    var Tester = Struct.immutable('data', 'start', 'finish');

    var checkGetAt = function (expected, input, gen, offset) {
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

    checkGetAt(Option.none(), [], gen, 0);
    checkGetAt(Option.some('a'), ['a'], gen, 0);
    checkGetAt(Option.some('a'), ['a'], gen, 1);
    checkGetAt(Option.none(), ['a'], gen, 2);
    checkGetAt(Option.some('cat'), ['this', 'was', 'a', 'cat', 'today', 'and', 'tomorrow'], gen, 10);
    checkGetAt(Option.some('tomorrow'), ['this', 'was', 'a', 'cat', 'today', 'and', 'tomorrow'], gen, 26);
    checkGetAt(Option.none(), ['this', 'was', 'a', 'cat', 'today', 'and', 'tomorrow'], gen, 28);


    (function () {
      var input = [['a', 2], ['b', 5], ['c', 6]];
      var list = PositionArray.make(input, function (a, start) {
        return Option.some(Tester(a[0], start, start + a[1]));
      });

      var actual = PositionArray.splitAt(list, 3, 10, function (first, a) {
        if (a.start() === first) {
          return [a];
        } else if (a.finish() === first) {
          return [a];
        } else if (first > a.start() && first < a.finish()) {
          return [Tester(a.data(), a.start(), first), Tester('aa', first, a.finish())];
        } else {
          return [a];
        }
      }, function (last, a) {
        if (a.start() === last) {
          return [a];
        } else if (a.finish() === last) {
          return [a];
        } else if (last > a.start() && last < a.finish()) {
          return [Tester(a.data(), a.start(), last), Tester('bb', last, a.finish())];
        } else {
          return [a];
        }

      });
      assert.eq([['a', 0, 2], ['b', 2, 3], ['aa', 3, 7], ['c', 7, 10], ['bb', 10, 13]], Arr.map(actual, function (x) {
        return [x.data(), x.start(), x.finish()];
      }));
    })();

    (function () {
      var input = [['a', 2], ['b', 5], ['c', 6]];
      var list = PositionArray.make(input, function (a, start) {
        return Option.some(Tester(a[0], start, start + a[1]));
      });

      var check = function (expected, start, finish) {
        var actual = PositionArray.sub(list, start, finish);
        assert.eq(expected, Arr.map(actual, function (x) {
          return x.data();
        }));
      };

      check(['a'], 0, 2);
      check([], 2, 8);
      check(['b'], 2, 7);
      check(['b', 'c'], 2, 13);
    })();

  }
);
