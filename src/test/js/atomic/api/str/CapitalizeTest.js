test('capitalize',

  [
    'ephox.katamari.api.Strings'
  ],

  function(Strings) {

    function check(expected, input) {
      var actual = Strings.capitalize(input);
        assert.eq(expected, actual);
    }

    check("", "");
    check("A", "a");
    check("A", "A");
    check("Abc", "abc");
    check("Abc", "Abc");
    check("ABC", "ABC");
    check("CBA", "CBA");
    check("CBA", "cBA");
  }
);
