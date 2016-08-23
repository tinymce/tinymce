test('ensureLeading',

  [
    'ephox.katamari.api.Strings'
  ],

  function(Strings) {

    function check(expected, str, prefix) {
        var actual = Strings.ensureLeading(str, prefix);
        assert.eq(expected, actual);
    }

    check("", "", "");
    check("a", "a", "a");
    check("ab", "ab", "a");
    check("ab", "b", "a");
    check("a", "", "a");
  }
);

