test(
  'Word Util',

  [
    'ephox.robin.util.WordUtil'
  ],

  function (WordUtil) {

    var checkNone = function (text, word) {
      var actual = word(text);
      assert.eq(true, actual.isNone());
    };

    var check = function (expected, text, word) {
      var actual = word(text);
      actual.fold(function () {
        assert.fail('Expected: ' + expected + ' but received nothing.');
      }, function (v) {
        assert.eq(expected, v);
      });
    };

    checkNone('ballast', WordUtil.firstWord);
    checkNone('ballast', WordUtil.lastWord);
    check(' one', 'ballast one', WordUtil.lastWord);
    check(' one', 'ballast  one', WordUtil.lastWord);
    check(' d', 'a b c d', WordUtil.lastWord);
    check('one ', 'one ballast', WordUtil.firstWord);
    check('one ', 'one two three ', WordUtil.firstWord);
    check(' ', '  o pp qq', WordUtil.firstWord);
    check('apple ', 'apple bear cat', WordUtil.firstWord);
    check('apple ', 'apple ', WordUtil.firstWord);

  }
);