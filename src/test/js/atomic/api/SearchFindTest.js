test(
  'api.Search.findall (using api.Pattern)',

  [
    'ephox.compass.Arr',
    'ephox.polaris.api.Pattern',
    'ephox.polaris.api.Search',
    'ephox.polaris.pattern.Safe',
    'ephox.scullion.Struct'
  ],

  function (Arr, Pattern, Search, Safe, Struct) {
    var checkAll = function (expected, input, pattern) {
      var actual = Search.findall(input, pattern);
      assert.eq(expected.length, actual.length);
      Arr.each(expected, function (exp, i) {
        assert.eq(exp[0], actual[i].start());
        assert.eq(exp[1], actual[i].finish());
      });
    };

    var checkMany = function (expected, text, targets) {
      var actual = Search.findmany(text, targets);
      assert.eq(expected.length, actual.length);
      Arr.each(expected, function (exp, i) {
        assert.eq(exp[0], actual[i].start());
        assert.eq(exp[1], actual[i].finish());
        assert.eq(exp[2], actual[i].name());
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
    checkAll([[0, 3], [4, 7], [8, 11]], 'sre sre sre ', Pattern.unsafeword('sre'));
    checkAll([[1, 4], [5, 8], [9, 12]], ' sre sre sre ', Pattern.unsafeword('sre'));

    checkAll([['this '.length, 'this e\uFEFFnds'.length ]], 'this e\uFEFFnds here', Pattern.unsafeword('e\uFEFFnds'));

    var prefix = Safe.sanitise('[');
    var suffix = Safe.sanitise(']');
    checkAll([[1, 5]], ' [wo] and more', Pattern.unsafetoken(prefix + '[^' + suffix + ']*' + suffix));

    var testData = Struct.immutable('pattern', 'name');
    checkMany([], '', []);
    checkMany([
      [1, 3, 'alpha']
    ], ' aa bb cc', [
      testData(Pattern.safeword('aa'), 'alpha')
    ]);

    checkMany([
      [0, 2, 'alpha'],
      [3, 6, 'beta'],
      [8, 18, 'gamma']
    ], 'aa bbb  abcdefghij', [
      testData(Pattern.safeword('bbb'), 'beta'),
      testData(Pattern.safeword('abcdefghij'), 'gamma'),
      testData(Pattern.safeword('aa'), 'alpha'),
      testData(Pattern.safeword('not-there'), 'delta')
    ]);
  }
);
