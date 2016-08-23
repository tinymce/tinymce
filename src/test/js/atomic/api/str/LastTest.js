test('last',

  [
    'ephox.katamari.api.Strings'
  ],

  function(Strings) {

    function check(expected, str, count) {
        var actual = Strings.last(str, count);
        assert.eq(expected, actual);
    }

    check("", "", 0);
    check("", "a", 0);
    check("a", "a", 1);
    check("b", "ab", 1);
    check("ab", "ab", 2);
  }
);

