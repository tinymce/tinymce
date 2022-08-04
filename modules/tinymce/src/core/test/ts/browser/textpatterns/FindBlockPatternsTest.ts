import { context, describe, it } from '@ephox/bedrock-client';
import { TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import * as BlockPattern from 'tinymce/core/textpatterns/core/BlockPattern';
import { DynamicPatternContext, PatternSet } from 'tinymce/core/textpatterns/core/PatternTypes';
import { getParentBlock, resolveFromDynamicPatterns } from 'tinymce/core/textpatterns/utils/Utils';

import { getPatternSetFor } from '../../module/test/TextPatternsUtils';

// Similar to modules/tinymce/src/core/test/ts/atomic/textpatterns/FindBlockPatternsTest.ts
// but uses DOM and includes tests for text_patterns_lookup
describe('browser.tinymce.textpatterns.FindBlockPatternsTest', () => {

  const findPatternsWithDynamicPatterns = (editor: Editor, patternSet: PatternSet, normalizedMatches: boolean) => getParentBlock(editor, editor.selection.getRng()).map((block) => {
    const dynamicPatternSet = resolveFromDynamicPatterns(patternSet, block, block.textContent ?? '');
    return BlockPattern.findPatterns(editor, block, dynamicPatternSet, normalizedMatches);
  }).getOr([]);

  context('no text_patterns_lookup', () => {
    const hook = TinyHooks.bddSetupLight<Editor>({
      text_patterns: [
        { start: '*', end: '*', format: 'italic' },
        { start: '**', end: '**', format: 'bold' },
        { start: '#', format: 'h1' },
        { start: '##', format: 'h2' },
        { start: '###', format: 'h3' }
      ],
      base_url: '/project/tinymce/js/tinymce'
    }, []);

    const getPatternSet = getPatternSetFor(hook);

    // TODO: This may not be the expected behaviour, depending on the decisions that being made in TINY-4303
    it('TBA: # triggers heading match when block tag matches forced_root_block', () => {
      const editor = hook.editor();
      // For block patterns to execute, the block tag must be the same as the
      // forced root block. We aren't sure why this constraint exists.
      editor.setContent('<p># Heading</p>');
      TinySelections.setCursor(editor, [ 0, 0 ], '# Heading'.length);
      const matches = findPatternsWithDynamicPatterns(editor, getPatternSet(), true);
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

    it('TINY-8778: * does not trigger a match', () => {
      const editor = hook.editor();
      editor.setContent('<p>* No match');
      TinySelections.setCursor(editor, [ 0, 0 ], 1);
      const matches = findPatternsWithDynamicPatterns(editor, getPatternSet(), true);
      assert.deepEqual(matches, []);
    });

    // TODO: This may not be the expected behaviour, depending on the decisions that being made in TINY-4303
    it('TBA: # does not trigger heading match when block tag does not match forced_root_block', () => {
      const editor = hook.editor();
      // For block patterns to execute, the block tag must be the same as the
      // forced root block. We aren't sure why this constraint exists.
      editor.setContent('<div># Heading</div>');
      TinySelections.setCursor(editor, [ 0, 0 ], '# Heading'.length);
      const matches = findPatternsWithDynamicPatterns(editor, getPatternSet(), true);
      assert.deepEqual(
        matches,
        [],
        'Checking block pattern matches - do not match for incorrect block tag type'
      );
    });
  });

  context('with text_patterns_lookup', () => {
    const hook = TinyHooks.bddSetupLight<Editor>({
      text_patterns: [
        { start: '*', end: '*', format: 'italic' },
        { start: '**', end: '**', format: 'bold' },
        { start: '#', format: 'h1' },
        { start: '##', format: 'h2' },
        { start: '###', format: 'h3' },
        { start: '#####', format: 'h5' },
        { start: '' }
      ],
      text_patterns_lookup: (_ctx: DynamicPatternContext) => [
        { start: '####', format: 'h4' },
        { start: 'TBA', cmd: 'mceInsertContent', value: 'To be announced' },
        { start: '###', cmd: 'mceInsertContent', value: 'h3 heading' }
      ],
      base_url: '/project/tinymce/js/tinymce'
    }, []);

    const getPatternSet = getPatternSetFor(hook);

    it('TINY-8778: Match a heading format which is extending the existing text patterns', () => {
      const editor = hook.editor();
      editor.setContent('<p>#### wow</p>');
      TinySelections.setCursor(editor, [ 0, 0 ], 4);
      const matches = findPatternsWithDynamicPatterns(editor, getPatternSet(), true);
      assert.deepEqual(
        matches,
        [
          {
            pattern: {
              type: 'block-format',
              start: '####',
              format: 'h4'
            },
            range: {
              start: [ 0, 0 ],
              end: [ 0, 0 ]
            }
          }
        ],
        'Checking block pattern matches'
      );
    });

    it('TINY-8778: Match a command pattern', () => {
      const editor = hook.editor();
      editor.setContent('<p><b>TBA Bold heading</b></p>');
      TinySelections.setCursor(editor, [ 0, 0, 0 ], 3);
      const matches = findPatternsWithDynamicPatterns(editor, getPatternSet(), true);
      assert.deepEqual(
        matches,
        [
          {
            pattern: {
              type: 'block-command',
              start: 'TBA',
              cmd: 'mceInsertContent',
              value: 'To be announced'
            },
            range: {
              start: [ 0, 0 ],
              end: [ 0, 0 ]
            }
          }
        ],
        'Checking block pattern matches'
      );
    });

    // TODO: This maybe need to be fixed, depending on the decisions that being made in TINY-4303
    it('TINY-8778: Match a heading where its block tag matches forced_root_block but its parent block does not', () => {
      const editor = hook.editor();
      editor.setContent('<div><p>#### New heading type</p></div>');
      TinySelections.setCursor(editor, [ 0, 0, 0 ], 4);
      const matches = findPatternsWithDynamicPatterns(editor, getPatternSet(), true);
      assert.deepEqual(matches, [
        {
          pattern: {
            type: 'block-format',
            start: '####',
            format: 'h4'
          },
          range: {
            start: [ 0, 0, 0 ],
            end: [ 0, 0, 0 ]
          }
        }
      ],
      'Checking block pattern matches'
      );
    });

    // TODO: This may not be the expected behaviour, depending on the decisions that being made in TINY-4303
    it('TBA: Does not trigger a match if the block tag does not match forced_root_block', () => {
      const editor = hook.editor();
      editor.setContent('<div>#### New heading type</div>');
      TinySelections.setCursor(editor, [ 0, 0 ], 4);
      const matches = findPatternsWithDynamicPatterns(editor, getPatternSet(), true);
      assert.deepEqual(matches, [], 'Checking block pattern matches do not match for incorrect block tag type');
    });

    it('TINY-8778: Lookup patterns take precedence over static patterns', () => {
      const editor = hook.editor();
      editor.setContent('<p>### is a new heading</p>');
      TinySelections.setCursor(editor, [ 0, 0 ], 4);
      const matches = findPatternsWithDynamicPatterns(editor, getPatternSet(), true);
      assert.deepEqual(matches, [
        {
          pattern: {
            type: 'block-command',
            start: '###',
            cmd: 'mceInsertContent',
            value: 'h3 heading'
          },
          range: {
            start: [ 0, 0 ],
            end: [ 0, 0 ]
          }
        }
      ]);
    });

    it('TINY-8778: Match a static pattern instead if it is a better match', () => {
      const editor = hook.editor();
      editor.setContent('<p>##### Better matching heading</p>');
      TinySelections.setCursor(editor, [ 0, 0 ], '##### Better matching heading'.length);
      const matches = findPatternsWithDynamicPatterns(editor, getPatternSet(), true);
      assert.deepEqual(matches, [
        {
          pattern: {
            type: 'block-format',
            start: '#####',
            format: 'h5'
          },
          range: {
            start: [ 0, 0 ],
            end: [ 0, 0 ]
          }
        }
      ]);
    });
  });
});
