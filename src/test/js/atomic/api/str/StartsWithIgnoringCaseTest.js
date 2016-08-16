test('startsWithIgnoringCase',

  [
    'ephox.katamari.api.Strings'
  ],

  function(Strings) {

    function check(expected, str, prefix) {
        var actual = Strings.startsWithIgnoringCase(str, prefix);
        assert.eq(expected, actual);
    }

    check(true, "", "");
    check(true, "a", "");
    check(true, "a", "a");
    check(true, "ab", "a");
    check(true, "abc", "ab");
    check(false, "", "a");
    check(false, "caatatetatat", "cat");

    check(true, "a", "A");
    check(true, "A", "A");
    check(true, "A", "a");
    check(true, "AB", "a");
    check(true, "aBc", "aB");
  }
);

