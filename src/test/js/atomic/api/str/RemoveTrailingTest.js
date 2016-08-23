test('removeTrailing',

  [
    'ephox.katamari.api.Strings'
  ],

  function(Strings) {

    function check(expected, str, trail) {
        var actual = Strings.removeTrailing(str, trail);
        assert.eq(expected, actual);
    }

    check("", "", "");
    check("cat", "cat", "");
    check("", "", "/");
    check("cat", "cat/", "/");
    check("", "cat/", "cat/");
  }
);

