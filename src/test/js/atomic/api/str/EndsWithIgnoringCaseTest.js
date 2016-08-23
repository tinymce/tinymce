test('endsWithIgnoringCase',

  [
    'ephox.katamari.api.Strings'
  ],

  function(Strings) {

    function check(expected, str, suffix) {
        var actual = Strings.endsWithIgnoringCase(str, suffix);
        assert.eq(expected, actual);
    }

    check(true, "", "");
    check(true, "a", "");
    check(true, "a", "a");
    check(true, "ab", "b");
    check(true, "abc", "bc");
    check(false, "", "a");
    check(false, "caatatetatat", "cat");

    check(true, "a", "A");
    check(true, "ab", "B");
    check(true, "aBC", "bC");
  }
);
