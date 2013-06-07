test(
  'api.Search.findall',

  [
    'ephox.compass.Arr',
    'ephox.polaris.api.Search',
    'ephox.polaris.search.Pattern'
  ],

  function (Arr, Search, Pattern) {
    var checkAll = function (expected, input, pattern) {
      var actual = Search.findall(input, pattern);
      assert.eq(expected.length, actual.length);
      Arr.each(expected, function (exp, i) {
        assert.eq(exp[0], actual[i].start());
        assert.eq(exp[1], actual[i].finish());
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
