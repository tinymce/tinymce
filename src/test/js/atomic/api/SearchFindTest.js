test(
  'api.Search.findall (using api.Pattern)',

  [
    'ephox.compass.Arr',
    'ephox.polaris.api.Pattern',
    'ephox.polaris.api.Search'
  ],

  function (Arr, Pattern, Search) {
    var checkAll = function (expected, input, pattern) {
      var actual = Search.findall(input, pattern);
      assert.eq(expected.length, actual.length);
      Arr.each(expected, function (exp, i) {
        assert.eq(exp[0], actual[i].start());
        assert.eq(exp[1], actual[i].finish());
      });
    };

    checkAll([], 'eskimo', Pattern.unsafetoken('hi'));
    checkAll([[1, 7]], ' cattle', Pattern.unsafetoken('cattle'));
    checkAll([], 'acattle', Pattern.unsafeword('cattle'));
    checkAll([[1, 7]], ' cattle', Pattern.unsafeword('cattle'));

    checkAll([[3, 7], [10, 14]], "no it's i it's done.", Pattern.unsafetoken("it's"));
    checkAll([[0, 12]], "catastrophe'", Pattern.unsafetoken("catastrophe'"));

    checkAll([[0, 3]], 'sre', Pattern.unsafeword('sre'));
    checkAll([[0, 3]], 'sre ', Pattern.unsafeword('sre'));
    checkAll([[1, 4]], ' sre', Pattern.unsafeword('sre'));
    checkAll([[1, 4]], ' sre ', Pattern.unsafeword('sre'));
    checkAll([[0, 3], [4, 7]], 'sre sre', Pattern.unsafeword('sre'));
    checkAll([[1, 4], [5, 8]], ' sre sre', Pattern.unsafeword('sre'));
    checkAll([[1, 4], [5, 8], [9, 12]], ' sre sre sre', Pattern.unsafeword('sre'));
    checkAll([[1, 4], [5, 8], [9, 12]], ' sre sre sre ', Pattern.unsafeword('sre'));

  }
);
