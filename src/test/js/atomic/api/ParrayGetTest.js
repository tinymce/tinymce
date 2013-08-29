test(
  'api.PositionArray.get',

  [
    'ephox.perhaps.Option',
    'ephox.polaris.api.PositionArray',
    'ephox.polaris.test.Parrays'
  ],

  function (Option, PositionArray, Parrays) {
    var check = function (expected, input, offset) {
      var parray = Parrays.make(input);
      var actual = PositionArray.get(parray, offset);
      expected.fold(function () {
        assert.eq(true, actual.isNone());
      }, function (v) {
        assert.eq(v, actual.getOrDie('getting nothing, expected: ' + v).item());
      });
    };

    check(Option.none(),           [], 0);
    check(Option.some('a'),        ['a'], 0);
    check(Option.some('a'),        ['a'], 1);
    check(Option.none(),           ['a'], 2);
    check(Option.some('cat'),      ['this', 'was', 'a', 'cat', 'today', 'and', 'tomorrow'], 'thiswasaca'.length);
    check(Option.some('tomorrow'), ['this', 'was', 'a', 'cat', 'today', 'and', 'tomorrow'], 'thiswasacattodayandto'.length);
    check(Option.none(),           ['this', 'was', 'a', 'cat', 'today', 'and', 'tomorrow'], 'thiswasacattodayandtomorrow-'.length);

  }
);
