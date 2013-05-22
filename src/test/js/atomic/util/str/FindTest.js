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
  }
);
