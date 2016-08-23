test('trim',

  [
    'ephox.katamari.api.Strings'
  ],

  function(Strings) {

    function check(expectedL, expectedR, expected, input) {
        assert.eq(expected, Strings.trim(input));
        assert.eq(expectedL, Strings.lTrim(input));
        assert.eq(expectedR, Strings.rTrim(input));
    }

    check("", "", "", "");
    check("", "", "", " ");
    check("", "", "", "  ");
    check("a", "a", "a", "a");
    check("a ", "a", "a", "a ");
    check("a", " a", "a", " a");
    check("a ", " a", "a", " a ");
    check("a      ", "    a", "a", "    a      ");
    check("a    b  cd  ", "    a    b  cd", "a    b  cd", "    a    b  cd  ");
  }
);
