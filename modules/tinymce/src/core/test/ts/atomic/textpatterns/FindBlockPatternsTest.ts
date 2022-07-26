import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';

import * as BlockPattern from 'tinymce/core/textpatterns/core/BlockPattern';
import * as Pattern from 'tinymce/core/textpatterns/core/Pattern';

describe('atomic.tinymce.textpatterns.FindBlockPatternsTest', () => {
  it('should find the start of the default patterns', () => {
    const patternSet = Pattern.createPatternSet(
      Pattern.fromRawPatterns([
        { start: '*', end: '*', format: 'italic' },
        { start: '**', end: '**', format: 'bold' },
        { start: '#', format: 'h1' },
        { start: '##', format: 'h2' },
        { start: '###', format: 'h3' },
        { start: '####', format: 'h4' },
        { start: '#####', format: 'h5' },
        { start: '######', format: 'h6' },
        { start: '1. ', cmd: 'InsertOrderedList' },
        { start: '* ', cmd: 'InsertUnorderedList' },
        { start: '- ', cmd: 'InsertUnorderedList' }
      ]),
      // the lookup function isn't important, as this is just focusing on initial
      // block patterns
      () => []
    );
    const defaultPatterns = patternSet.blockPatterns;

    const testFindStartPattern = (text: string, expectedPattern: string) => {
      const actual = BlockPattern.findPattern(defaultPatterns, text).getOrDie();
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
