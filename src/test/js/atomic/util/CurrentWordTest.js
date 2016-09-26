test(
  'CurrentWordTest',

  [
    'ephox.agar.api.RawAssertions',
    'ephox.perhaps.Option',
    'ephox.robin.util.CurrentWord'
  ],

  function (RawAssertions, Option, CurrentWord) {
    var check = function (expected, text, position) {
      var actual = CurrentWord.around(text, position);
      RawAssertions.assertEq('Checking before :: Option', expected.before.getOr('none'), actual.before().getOr('none'));
      RawAssertions.assertEq('Checking after :: Option', expected.after.getOr('none'), actual.after().getOr('none'));
    };

    check({ before: Option.some(' this is a '.length), after: Option.some(' this is a test'.length) },
      ' this is a test case', ' this is a t'.length);
    check({ before: Option.some(' this is a test '.length), after: Option.none() },
      ' this is a test case', ' this is a test ca'.length);

    check({ before: Option.some(' this is a test'.length), after: Option.some(' this is a test'.length) },
      ' this is a test case', ' this is a test'.length);
    check({ before: Option.some(' this is a test '.length), after: Option.none() },
      ' this is a test case', ' this is a test case'.length);
    check({ before: Option.some(16), after: Option.none() }, ' this is a test case', ' this is a test ca'.length);
  }
);
