test('removeLeading',

  [
    'ephox.katamari.api.Strings'
  ],

  function(Strings) {

    function check(expected, str, trail) {
        var actual = Strings.removeLeading(str, trail);
        assert.eq(expected, actual);
    }

    check("", "", "");
    check("cat", "cat", "");
    check("", "", "/");
    check("cat", "/cat", "/");
    check("", "cat/", "cat/");

    check("dog", "catdog", "cat");
  }
);

