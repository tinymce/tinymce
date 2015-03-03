test(
  'api.Sanitise.css',

  [
    'ephox.polaris.string.Sanitise'
  ],

  function (Sanitise) {
    var check = function (expected, input) {
      var actual = Sanitise.css(input);
      assert.eq(expected, actual);
    };

    check('e', '');
    check('a', 'a');
    check('abcdefg', 'abcdefg');
    check('e_bogus', '_bogus');
    check('a-big-long-string', 'a big long string');
  }
);
