test('equalsIgnoringCase',

  [
    'ephox.katamari.api.Strings'
  ],

  function(Strings) {

    function check(expected, str, substr) {
        var actual = Strings.equalsIgnoringCase(str, substr);
        assert.eq(expected, actual);
    }

    check(false, "a", "b");
    check(false, "cat", "dog");
    check(false, "abc", "x");
    check(false, "", "x");

    check(true, "", "");
    check(true, "a", "a");
    check(true, "A", "a");
    check(true, "a", "A");
    check(true, "A", "A");

    check(true, "AbC", "aBc");
  }
);

