import { RawAssertions } from '@ephox/agar';
import * as Settings from 'tinymce/plugins/textpattern/api/Settings';
import { UnitTest } from '@ephox/bedrock';
import { findEndPattern, findPattern } from '../../../main/ts/core/FindPatterns';

UnitTest.test('atomic.tinymce.plugins.textpattern.FindPatternTest', function () {
  const inlinePatterns = Settings.getPatternSet({}).inlinePatterns;
  const defaultPatterns = [
    ...inlinePatterns,
    ...Settings.getPatternSet({}).blockPatterns,
    ...Settings.getPatternSet({}).replacementPatterns
  ];

  const testFindEndPattern = function (text: string, offset: number, space: boolean, expectedPattern: string) {
    const actual = findEndPattern(inlinePatterns, text, offset, space ? 1 : 0);

    RawAssertions.assertEq('Assert correct pattern', expectedPattern, actual.end);
  };

  const testFindStartPattern = function (text: string, expectedPattern: string) {
    const actual = findPattern(defaultPatterns, text);

    RawAssertions.assertEq('Assert correct pattern', expectedPattern, actual.start);
  };

  const testFindStartPatternUndefined = function (text: string) {
    const actual = findPattern(defaultPatterns, text);

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
