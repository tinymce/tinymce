import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';

import { findPattern } from 'tinymce/core/textpatterns/core/BlockPattern';
import { generatePatternSet } from 'tinymce/core/textpatterns/TextPatterns';

describe('atomic.tinymce.textpatterns.FindBlockPatternsTest', () => {
  it('should find the start of the default patterns', () => {
    const patternSet = generatePatternSet([
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
    ]);
    const defaultPatterns = patternSet.blockPatterns;

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
