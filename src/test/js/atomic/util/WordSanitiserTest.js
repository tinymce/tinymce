test(
  'Word Sanitiser',

  [
    'ephox.perhaps.Option',
    'ephox.robin.data.WordScope',
    'ephox.robin.util.WordSanitiser'
  ],

  function (Option, WordScope, WordSanitiser) {

    var some = Option.some;
    var none = Option.none();
  
    var ns = function (word, v) {
      return WordScope(word, none, some(v));
    };

    var ss = function (word, v1, v2) {
      return WordScope(word, some(v1), some(v2));
    };

    var nn = function (word) {
      return WordScope(word, none, none);
    };

    var check = function (expected, input) {
      var actual = WordSanitiser.scope(input);
      assert.eq(expected.word(), actual.word());
      assert.eq(true, expected.left().equals(actual.left()));
      assert.eq(true, expected.right().equals(actual.right()));
    };

    check(ss('one', 'a', 'z'), ss('one', 'a', 'z'));
    check(ss('one', 'a', "'"), ss("one'", 'a', 'z'));
    check(ss('one', "'", 'z'), ss("'one", 'a', 'z'));
    check(ss("'twas", 'a', 'b'), ss("'twas", 'a', 'b'));
    check(ss("'twas", "'", "'"), ss("''twas'", 'a', 'b'));
    check(ss("''one''", 'a', 'b'), ss("''one''", 'a', 'b'));
    check(ss("'twas", "'", 'c'), ss("''twas", 'a', 'c'));

  }
);