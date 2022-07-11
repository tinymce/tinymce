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
        { start: '###', format: 'h3' }
      ],
      base_url: '/project/tinymce/js/tinymce'
    }, []);

    const getPatternSet = getPatternSetFor(hook);

    it('TBA: # triggers heading match when block tag matches forced_root_block', () => {
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

    it('* does not trigger a match', () => {
      const editor = hook.editor();
      editor.setContent('<p>* No match');
      TinySelections.setCursor(editor, [ 0, 0 ], 1);
      const matches = BlockPattern.findPatterns(editor, getPatternSet());
      assert.deepEqual(matches, []);
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
        [],
        'Checking block pattern matches - do not match for incorrect block tag type'
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
        { start: '' }
      ],
      text_patterns_lookup: (_ctx) => {
        return [
          { start: '####', format: 'h4' },
          { start: 'TBA', cmd: 'mceInsertContent', value: 'To be announced' },
          { start: '###', cmd: 'mceInsertContent', value: 'h3 heading' }
        ];
      },
      base_url: '/project/tinymce/js/tinymce'
    }, []);

    const getPatternSet = getPatternSetFor(hook);

    it('TBA: Match a heading format which is extending the existing text patterns', () => {
      const editor = hook.editor();
      editor.setContent('<p>#### wow</p>');
      TinySelections.setCursor(editor, [ 0, 0 ], 4);
      const matches = BlockPattern.findPatterns(editor, getPatternSet());
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

    it('TBA: Match a command pattern', () => {
      const editor = hook.editor();
      editor.setContent('<p><b>TBA Bold heading</b></p>');
      TinySelections.setCursor(editor, [ 0, 0, 0 ], 3);
      const matches = BlockPattern.findPatterns(editor, getPatternSet());
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

    it('TBA: Match a heading where its block tag matches forced_root_block but its parent block does not', () => {
      const editor = hook.editor();
      editor.setContent('<div><p>#### New heading type</p></div>');
      TinySelections.setCursor(editor, [ 0, 0, 0 ], 4);
      const patterns = getPatternSet();
      const matches = BlockPattern.findPatterns(editor, patterns);
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

    it('TBA: Does not trigger a match if the block tag does not match forced_root_block', () => {
      const editor = hook.editor();
      editor.setContent('<div>#### New heading type</div>');
      TinySelections.setCursor(editor, [ 0, 0 ], 4);
      const matches = BlockPattern.findPatterns(editor, getPatternSet());
      assert.deepEqual(matches, [], 'Checking block pattern matches do not match for incorrect block tag type');
    });

    it('TBA: Lookup patterns take precendence over block patterns', () => {
      const editor = hook.editor();
      editor.setContent('<p>### is a new heading</p>');
      TinySelections.setCursor(editor, [ 0, 0 ], 4);
      const matches = BlockPattern.findPatterns(editor, getPatternSet());
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
  });
});
