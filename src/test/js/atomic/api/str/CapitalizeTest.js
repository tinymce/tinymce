test('capitalize',

  [
    'ephox.katamari.api.Strings',
    'ephox.wrap.Jsc'
  ],

  function(Strings, Jsc) {
    function check(expected, input) {
      var actual = Strings.capitalize(input);
      assert.eq(expected, actual);
    }

    check('', '');
    check('A', 'a');
    check('A', 'A');
    check('Abc', 'abc');
    check('Abc', 'Abc');
    check('ABC', 'ABC');
    check('CBA', 'CBA');
    check('CBA', 'cBA');

    Jsc.property(
      'Capitalize(s).substring(1) = s.substring(1)',
      Jsc.asciistring,
      function (s) {
        return s.length <= 1 || Jsc.eq(Strings.capitalize(s).substring(1), s.substring(1));
      }
    );
  }
);
