import { describe, it } from '@ephox/bedrock-client';
import { Thunk } from '@ephox/katamari';
import { TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import * as Options from 'tinymce/core/api/Options';
import * as BlockPattern from 'tinymce/core/textpatterns/core/BlockPattern';
import * as Pattern from 'tinymce/core/textpatterns/core/Pattern';
import { PatternSet } from 'tinymce/core/textpatterns/core/PatternTypes';

const getPatternSetFor = (hook: TinyHooks.Hook<Editor>) => Thunk.cached((): PatternSet => {
  const editor = hook.editor();
  const rawPatterns = Options.getTextPatterns(editor);
  const dynamicPatternsLookup = Options.getTextPatternsLookup(editor);
  return Pattern.createPatternSet(
    Pattern.fromRawPatterns(rawPatterns),
    dynamicPatternsLookup
  );
});

describe('browser.tinymce.core.textpatterns.FindBlockPatternTest', () => {

  describe('no text_patterns_lookup', () => {
    const hook = TinyHooks.bddSetupLight<Editor>({
      text_patterns: [
        { start: '*', end: '*', format: 'italic' },
        { start: '**', end: '**', format: 'bold' },
        { start: '#', format: 'h1' },
        { start: '##', format: 'h2' },
        { start: '###', format: 'h3' },
      ],
      base_url: '/project/tinymce/js/tinymce'
    }, [ ]);

    const getPatternSet = getPatternSetFor(hook);

    it('TBA: # Triggers heading match when block tag matches forced_root_block', () => {
      const editor = hook.editor();
      // For block patterns to execute, the block tag must be the same as the
      // forced root block. We aren't sure why this constraint exists.
      editor.setContent('<p># Heading</p>');
      TinySelections.setCursor(editor, [ 0, 0 ], '# Heading'.length);
      const matches = BlockPattern.findPatterns(editor, getPatternSet());
      assert.deepEqual(
        matches,
        [
          {
            pattern: {
              type: 'block-format',
              start: '#',
              format: 'h1'
            },
            range: { start: [ 0, 0 ], end: [ 0, 0 ] }
          }
        ],
        'Checking block pattern matches'
      );
    });

    it('TBA: # does not trigger heading match when block tag does not match forced_root_block', () => {
      const editor = hook.editor();
      // For block patterns to execute, the block tag must be the same as the
      // forced root block. We aren't sure why this constraint exists.
      editor.setContent('<div># Heading</div>');
      TinySelections.setCursor(editor, [ 0, 0 ], '# Heading'.length);
      const matches = BlockPattern.findPatterns(editor, getPatternSet());
      assert.deepEqual(
        matches,
        [ ],
        'Checking block pattern matches do not match for incorrect block tag type'
      );
    });
  });

  describe('with text_patterns_lookup', () => {
    const hook = TinyHooks.bddSetupLight<Editor>({
      text_patterns: [
        { start: '*', end: '*', format: 'italic' },
        { start: '**', end: '**', format: 'bold' },
        { start: '#', format: 'h1' },
        { start: '##', format: 'h2' },
        { start: '###', format: 'h3' },
      ],
      base_url: '/project/tinymce/js/tinymce'
    }, [ ]);

    const getPatternSet = getPatternSetFor(hook);

    it.skip('TBA: # Triggers dynamic match when block tag matches forced_root_block', () => {
      // eslint-disable-next-line no-console
      console.log('PatternSet: ', { getPatternSet: getPatternSet() });
    });
  });
});