test('first',

  [
    'ephox.katamari.api.Strings'
  ],

  function(Strings) {

    function check(expected, str, count) {
        var actual = Strings.first(str, count);
        assert.eq(expected, actual);
    }

    check("", "", 0);
    check("", "a", 0);
    check("a", "a", 1);
    check("a", "ab", 1);
    check("ab", "ab", 2);
    check("ab", "abc", 2);
  }
);

