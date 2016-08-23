test('startsWith',

  [
    'ephox.katamari.api.Strings'
  ],

  function(Strings) {

    function check(expected, str, prefix) {
        var actual = Strings.startsWith(str, prefix);
        assert.eq(expected, actual);
    }

    check(true, "", "");
    check(true, "a", "");
    check(true, "a", "a");
    check(true, "ab", "a");
    check(true, "abc", "ab");

    check(false, "", "a");
    check(false, "caatatetatat", "cat");
  }
);
