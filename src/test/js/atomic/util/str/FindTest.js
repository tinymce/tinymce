test(
  'FindTest',

  [
    'ephox.phoenix.search.Pattern',
    'ephox.phoenix.util.str.Find'
  ],

  function (Pattern, Find) {

    var check = function (expected, input, pattern) {
      var actual = Find.all(input, pattern);
      assert.eq(expected, actual);
    };

    check([], 'eskimo', Pattern.token('hi'));
    check([1], ' cattle', Pattern.token('cattle'));
    check([], 'acattle', Pattern.word('cattle'));
    check([1], ' cattle', Pattern.word('cattle'));

    check([3, 10], "no it's i it's done.", Pattern.token("it's"));
    check([0], "catastrophe'", Pattern.token("catastrophe'"));
  }
);
