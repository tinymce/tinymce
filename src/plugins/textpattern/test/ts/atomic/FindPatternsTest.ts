import { RawAssertions } from '@ephox/agar';
import * as Settings from 'tinymce/plugins/textpattern/api/Settings';
import { UnitTest } from '@ephox/bedrock';
import { findPattern } from '../../../main/ts/core/FindPatterns';

UnitTest.test('atomic.tinymce.plugins.textpattern.FindPatternTest', function () {
  const inlinePatterns = Settings.getPatternSet({}).inlinePatterns;
  const defaultPatterns = [
    ...inlinePatterns,
    ...Settings.getPatternSet({}).blockPatterns,
  ];

  const testFindStartPattern = function (text: string, expectedPattern: string) {
    const actual = findPattern(defaultPatterns, text);

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
});
