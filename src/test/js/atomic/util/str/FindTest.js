test(
  'FindTest',

  [
    'ephox.perhaps.Option',
    'ephox.phoenix.search.Pattern',
    'ephox.phoenix.util.str.Find'
  ],

  function (Option, Pattern, Find) {

    var checkAll = function (expected, input, pattern) {
      var actual = Find.all(input, pattern);
      assert.eq(expected, actual);
    };

    var checkFrom = function (expected, input, pattern, offset) {
      var actual = Find.from(input, pattern, offset);
      expected.fold(function () {
        assert.eq(true, actual.isNone(), 'Expected none, given: ' + actual.getOr('none'));
      }, function (v) {
        actual.fold(function () {
          assert.fail('Expected ' + v + ', given: none');
        }, function (vv) {
          assert.eq(v, vv);
        });
      });

    };

    checkAll([], 'eskimo', Pattern.token('hi'));
    checkAll([1], ' cattle', Pattern.token('cattle'));
    checkAll([], 'acattle', Pattern.word('cattle'));
    checkAll([1], ' cattle', Pattern.word('cattle'));

    checkAll([3, 10], "no it's i it's done.", Pattern.token("it's"));
    checkAll([0], "catastrophe'", Pattern.token("catastrophe'"));

    checkAll([0], 'sre', Pattern.word('sre'));
    checkAll([0], 'sre ', Pattern.word('sre'));
    checkAll([1], ' sre', Pattern.word('sre'));
    checkAll([1], ' sre ', Pattern.word('sre'));
    checkAll([0, 4], 'sre sre', Pattern.word('sre'));
    checkAll([1, 5], ' sre sre', Pattern.word('sre'));
    checkAll([1, 5, 9], ' sre sre sre', Pattern.word('sre'));
    checkAll([1, 5, 9], ' sre sre sre ', Pattern.word('sre'));

    checkFrom(Option.some([0, 2]), 'hi', Pattern.word('hi'), 0);
    checkFrom(Option.some([1, 3]), ' hi', Pattern.word('hi'), 0);
    checkFrom(Option.none(), ' hello', Pattern.word('he'), 0);
    checkFrom(Option.none(), ' hello', Pattern.word('hello'), 1);
    checkFrom(Option.some([1, 6]), ' hello', Pattern.word('hello'), 0);
  }
);
