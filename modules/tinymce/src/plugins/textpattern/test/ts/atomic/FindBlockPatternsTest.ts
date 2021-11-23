import { before, describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import * as Options from 'tinymce/plugins/textpattern/api/Options';
import { findPattern } from 'tinymce/plugins/textpattern/core/BlockPattern';

describe('atomic.tinymce.plugins.textpattern.FindBlockPatternsTest', () => {
  let defaultPatternSet;
  const mockEditor = {
    options: {
      register: (name: string, spec: Record<string, any>) => {
        if (name === 'textpattern_patterns') {
          defaultPatternSet = spec.processor(spec.default).value;
        }
      },
      get: (name: string) => {
        return name === 'textpattern_patterns' ? defaultPatternSet : undefined;
      }
    }
  } as Editor;

  before(() => {
    Options.register(mockEditor);
  });

  it('should find the start of the default patterns', () => {
    const patternSet = Options.getPatternSet(mockEditor as any);
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
