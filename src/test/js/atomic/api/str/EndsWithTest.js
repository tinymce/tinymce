test('endsWith',

  [
    'ephox.katamari.api.Strings'
  ],

  function(Strings) {

    function check(expected, str, suffix) {
        var actual = Strings.endsWith(str, suffix);
        assert.eq(expected, actual);
    }

    check(true, "", "");
    check(true, "a", "");
    check(true, "a", "a");
    check(true, "ab", "b");
    check(true, "abc", "bc");

    check(false, "", "a");
    check(false, "caatatetatat", "cat");
  }
);

