test('removeLeading',

  [
    'ephox.katamari.api.Strings',
    'ephox.wrap.Jsc'
  ],

  function(Strings, Jsc) {

    function check(expected, str, trail) {
      var actual = Strings.removeLeading(str, trail);
      assert.eq(expected, actual);
    }

    check('', '', '');
    check('cat', 'cat', '');
    check('', '', '/');
    check('cat', '/cat', '/');
    check('', 'cat/', 'cat/');

    check('dog', 'catdog', 'cat');

    Jsc.property(
      'startsWith(removeLeading(str, s1), s1) === false',
      Jsc.asciistring,
      Jsc.asciinestring,
      function (str, s1) {
        var doubleStart = Strings.startsWith(str, s1) && Strings.startsWith(str.substring(s1.length), s1);
        return Jsc.eq(
          doubleStart,
          Strings.startsWith(
            Strings.removeLeading(str, s1),
            s1
          )
        );
      }
    );

    Jsc.property(
      'removeLeading(s1 + str, s1) === str',
      Jsc.asciistring,
      Jsc.asciinestring,
      function (str, s1) {
        return Jsc.eq(str, Strings.removeLeading(s1 + str, s1));
      }
    );
  }
);

