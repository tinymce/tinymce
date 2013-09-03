test(
  'Word Sanitiser',

  [
    'ephox.perhaps.Option',
    'ephox.robin.data.WordScope',
    'ephox.robin.util.WordSanitiser'
  ],

  function (Option, WordScope, WordSanitiser) {

    var some = Option.some;

    var ss = function (word, v1, v2) {
      return WordScope(word, some(v1), some(v2));
    };

    var check = function (expected, input) {
      var actual = WordSanitiser.scope(input);
      assert.eq(expected.word(), actual.word());
      assert.eq(true, expected.left().equals(actual.left()));
      assert.eq(true, expected.right().equals(actual.right()));
    };

    check(ss('one',         '<',  '>'),   ss('one',         '<', '>'));
    check(ss('one',         '<',  '\''),  ss('one\'',       '<', '>'));
    check(ss('one',         '\'', '>'),   ss('\'one',       '<', '>'));
    check(ss('\'twas',      '<',  '>'),   ss('\'twas',      '<', '>'));
    check(ss('\'twas',      '\'', '\''),  ss('\'\'twas\'',  '<', '>'));
    check(ss('\'\'one\'\'', '<',  '>'),   ss('\'\'one\'\'', '<', '>'));
    check(ss('\'twas',      '\'', '>'),   ss('\'\'twas',    '<', '>'));

  }
);
