import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';

import { getPatternSet } from 'tinymce/plugins/textpattern/api/Settings';
import { findPattern } from 'tinymce/plugins/textpattern/core/BlockPattern';

describe('atomic.tinymce.plugins.textpattern.FindBlockPatternsTest', () => {
  const mockEditor = {
    getParam: (_term: string, default_pattern: any, _type: string) => (default_pattern)
  };
  const patternSet = getPatternSet(mockEditor as any);
  const defaultPatterns = patternSet.blockPatterns;

  it('should find the start of the default patterns', () => {
    const testFindStartPattern = (text: string, expectedPattern: string) => {
      const actual = findPattern(defaultPatterns, text).getOrNull();

      assert.equal(actual.start, expectedPattern, 'Assert correct pattern');
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
});
