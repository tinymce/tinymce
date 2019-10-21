import { Assert, UnitTest } from '@ephox/bedrock-client';
import * as Settings from 'tinymce/plugins/textpattern/api/Settings';
import { findPattern } from 'tinymce/plugins/textpattern/utils/Utils';

UnitTest.test('atomic.tinymce.plugins.textpattern.FindPatternTest', function () {
  const patternSet = Settings.getPatternSet({});
  const defaultPatterns = [
    ...patternSet.inlinePatterns,
    ...patternSet.blockPatterns
  ];

  const testFindStartPattern = function (text: string, expectedPattern: string) {
    const actual = findPattern(defaultPatterns, text).getOrNull();

    Assert.eq('Assert correct pattern', expectedPattern, actual.start);
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
});
