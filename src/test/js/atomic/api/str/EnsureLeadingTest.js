test('ensureLeading',

  [
    'ephox.katamari.api.Strings',
    'ephox.wrap.Jsc'
  ],

  function(Strings, Jsc) {

    function check(expected, str, prefix) {
      var actual = Strings.ensureLeading(str, prefix);
      assert.eq(expected, actual);
    }

    check('', '', '');
    check('a', 'a', 'a');
    check('ab', 'ab', 'a');
    check('ab', 'b', 'a');
    check('a', '', 'a');

    Jsc.property(
      'startsWith(ensureLeading(str, s1), s1) === true',
      Jsc.string,
      Jsc.nestring,
      function (str, s1) {
        return Jsc.eq(
          true,
          Strings.startsWith(
            Strings.ensureLeading(str, s1),
            s1
          )
        );
      }
    );
  }
);

