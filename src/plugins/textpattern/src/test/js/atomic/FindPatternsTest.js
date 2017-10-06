test(
  'atomic.tinymce.plugins.textpattern.FindPatternTest',

  [
    'ephox.agar.api.RawAssertions',
    'tinymce.plugins.textpattern.api.Settings',
    'tinymce.plugins.textpattern.core.Patterns'
  ],

  function (RawAssertions, Settings, Patterns) {
    var defaultPatterns = Settings.getPatterns({});

    var testFindEndPattern = function (text, offset, space, expectedPattern) {
      var actual = Patterns.findEndPattern(defaultPatterns, text, offset, space ? 1 : 0);

      RawAssertions.assertEq('Assert correct pattern', expectedPattern, actual.end);
    };

    var testFindStartPattern = function (text, expectedPattern) {
      var actual = Patterns.findPattern(defaultPatterns, text);

      RawAssertions.assertEq('Assert correct pattern', expectedPattern, actual.start);
    };

    var testFindStartPatternUndefined = function (text) {
      var actual = Patterns.findPattern(defaultPatterns, text);

      RawAssertions.assertEq('Assert correct pattern', undefined, actual);
    };

    testFindEndPattern('y **x** ', 8, true, '**');
    testFindEndPattern('y **x**', 7, false, '**');
    testFindEndPattern('y *x* ', 6, true, '*');
    testFindEndPattern('y *x*', 5, false, '*');

    testFindStartPattern('*x*', '*');
    testFindStartPattern('**x**', '**');
    testFindStartPattern('***x***', '***');
    testFindStartPatternUndefined('*x* ');

    testFindStartPattern('#x', '#');
    testFindStartPattern('##x', '##');
    testFindStartPattern('###x', '###');
    testFindStartPattern('####x', '####');
    testFindStartPattern('#####x', '#####');
    testFindStartPattern('######x', '######');
    testFindStartPattern('1. x', '1. ');
    testFindStartPattern('* x', '* ');
    testFindStartPattern('- x', '- ');
  }
);
