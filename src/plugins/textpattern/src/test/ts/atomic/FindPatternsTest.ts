import { RawAssertions } from '@ephox/agar';
import Settings from 'tinymce/plugins/textpattern/api/Settings';
import Patterns from 'tinymce/plugins/textpattern/core/Patterns';
import { UnitTest } from '@ephox/refute';

UnitTest.test('atomic.tinymce.plugins.textpattern.FindPatternTest', function() {
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
});

