test('ensureTrailing',

  [
    'ephox.katamari.api.Strings'
  ],

  function(Strings) {

    function check(expected, str, suffix) {
        var actual = Strings.ensureTrailing(str, suffix);
        assert.eq(expected, actual);
    }

    check("", "", "");
    check("a", "a", "a");
    check("aab", "a", "ab");
    check("cat/", "cat", "/");
    check("cat/", "cat/", "/");
    check("/", "", "/");
  }
);

