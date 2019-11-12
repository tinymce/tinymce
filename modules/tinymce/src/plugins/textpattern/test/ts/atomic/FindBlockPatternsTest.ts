import { RawAssertions } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { findPattern } from 'tinymce/plugins/textpattern/core/BlockPattern';
import { getPatternSet } from 'tinymce/plugins/textpattern/api/Settings';

UnitTest.test('atomic.tinymce.plugins.textpattern.FindBlockPatternsTest', function () {
  const patternSet = getPatternSet({});
  const defaultPatterns = patternSet.blockPatterns;

  const testFindStartPattern = function (text: string, expectedPattern: string) {
    const actual = findPattern(defaultPatterns, text).getOrNull();

    RawAssertions.assertEq('Assert correct pattern', expectedPattern, actual.start);
  };

  testFindStartPattern('#x', '#');
  testFindStartPattern('##x', '##');
  testFindStartPattern('###x', '###');
  testFindStartPattern('####x', '####');
  testFindStartPattern('#####x', '#####');
  testFindStartPattern('######x', '######');
  testFindStartPattern('1. x', '1. ');
  testFindStartPattern('* x', '* ');
  testFindStartPattern('- x', '- ');
  testFindStartPattern('#\u00a0x', '#');
  testFindStartPattern('1.\u00a0x', '1. ');
  testFindStartPattern('*\u00a0x', '* ');
});
