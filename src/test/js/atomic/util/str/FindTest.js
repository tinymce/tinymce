test(
  'FindTest',

  [
    'ephox.compass.Arr',
    'ephox.perhaps.Option',
    'ephox.phoenix.search.Pattern',
    'ephox.phoenix.util.str.Find',
    'ephox.scullion.Struct'
  ],

  function (Arr, Option, Pattern, Find, Struct) {

    var M = Struct.immutable('start', 'finish');

    var checkAll = function (rawExp, input, pattern) {
      var expected = Arr.map(rawExp, function (x) { return M(x[0], x[1]); });
      var actual = Find.all(input, pattern);
      assert.eq(expected.length, actual.length);
      Arr.each(expected, function (x, i) {
        assert.eq(x.start(), actual[i].start());
        assert.eq(x.finish(), actual[i].finish());
      });
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
    checkAll([[1, 7]], ' cattle', Pattern.token('cattle'));
    checkAll([], 'acattle', Pattern.word('cattle'));
    checkAll([[1, 7]], ' cattle', Pattern.word('cattle'));

    checkAll([[3, 7], [10, 14]], "no it's i it's done.", Pattern.token("it's"));
    checkAll([[0, 12]], "catastrophe'", Pattern.token("catastrophe'"));

    checkAll([[0, 3]], 'sre', Pattern.word('sre'));
    checkAll([[0, 3]], 'sre ', Pattern.word('sre'));
    checkAll([[1, 4]], ' sre', Pattern.word('sre'));
    checkAll([[1, 4]], ' sre ', Pattern.word('sre'));
    checkAll([[0, 3], [4, 7]], 'sre sre', Pattern.word('sre'));
    checkAll([[1, 4], [5, 8]], ' sre sre', Pattern.word('sre'));
    checkAll([[1, 4], [5, 8], [9, 12]], ' sre sre sre', Pattern.word('sre'));
    checkAll([[1, 4], [5, 8], [9, 12]], ' sre sre sre ', Pattern.word('sre'));

    checkFrom(Option.some([0, 2]), 'hi', Pattern.word('hi'), 0);
    checkFrom(Option.some([1, 3]), ' hi', Pattern.word('hi'), 0);
    checkFrom(Option.none(), ' hello', Pattern.word('he'), 0);
    checkFrom(Option.none(), ' hello', Pattern.word('hello'), 1);
    checkFrom(Option.some([1, 6]), ' hello', Pattern.word('hello'), 0);


    checkFrom(Option.some([11, 21]), 'doloremque laudantium, totam rem aperiam, eaque', Pattern.word('laudantium'), 10);
    checkFrom(Option.some([48, 58]), 'doloremque laudantium, totam rem aperiam, eaque doloremque', Pattern.word('doloremque'), 15);

  }
);
