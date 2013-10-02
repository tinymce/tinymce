test(
  'Word Util',

  [
    'ephox.perhaps.Option',
    'ephox.robin.test.Assertions',
    'ephox.robin.util.WordUtil'
  ],

  function (Option, Assertions, WordUtil) {

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

    var checkAt = function (expected, text, position) {
      var actual = WordUtil.around(text, position);
      Assertions.assertOpt(expected.before, actual.before());
      Assertions.assertOpt(expected.after, actual.after());
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

    checkAt({ before: Option.some(' this is a '.length), after: Option.some(' this is a test'.length) },
      ' this is a test case', ' this is a t'.length);
    checkAt({ before: Option.some(' this is a test '.length), after: Option.none() },
      ' this is a test case', ' this is a test ca'.length);

    /* Not sure what I want these edge of word things to return at this stage */

    checkAt({ before: Option.some(' this is a test'.length), after: Option.some(' this is a test'.length) },
      ' this is a test case', ' this is a test'.length);
    checkAt({ before: Option.some(' this is a test '.length), after: Option.some(' this is a test case'.length) },
      ' this is a test case', ' this is a test case'.length);
    checkAt({ before: Option.some(16), after: Option.none() }, ' this is a test case', ' this is a test ca'.length);

  }
);