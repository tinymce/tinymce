test('contains',

  [
    'ephox.katamari.api.Strings'
  ],

  function(Strings) {

    function check(expected, str, substr) {
        var actual = Strings.contains(str, substr);
        assert.eq(expected, actual);
    }

    check(false, "a", "b");
    check(false, "cat", "dog");
    check(false, "abc", "x");
    check(false, "", "x");
    check(true, "", "");
    check(true, "cat", "");
    check(true, "a", "a");
    check(true, "ab", "ab");
    check(true, "ab", "a");
    check(true, "ab", "b");
    check(true, "abc", "b");
  }
);

