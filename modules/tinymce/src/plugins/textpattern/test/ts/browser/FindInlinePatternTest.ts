import { describe, it } from '@ephox/bedrock-client';
import { Obj } from '@ephox/katamari';
import { TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import ListsPlugin from 'tinymce/plugins/lists/Plugin';
import * as Settings from 'tinymce/plugins/textpattern/api/Settings';
import { findPatterns } from 'tinymce/plugins/textpattern/core/InlinePattern';
import { InlinePattern, InlinePatternMatch } from 'tinymce/plugins/textpattern/core/PatternTypes';
import TextPatternPlugin from 'tinymce/plugins/textpattern/Plugin';
import { PathRange } from 'tinymce/plugins/textpattern/utils/PathRange';
import Theme from 'tinymce/themes/silver/Theme';

interface ExpectedPatternMatch {
  readonly pattern: Partial<InlinePattern>;
  readonly startRng: PathRange;
  readonly endRng: PathRange;
}

describe('browser.tinymce.plugins.textpattern.FindInlinePatternTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    forced_root_block: false,
    plugins: 'textpattern lists',
    base_url: '/project/tinymce/js/tinymce'
  }, [ ListsPlugin, TextPatternPlugin, Theme ]);

  const mockEditor = {
    getParam: () =>
      [
        { start: '*', end: '*', format: 'italic' },
        { start: '**', end: '**', format: 'bold' },
        { start: '***', end: '***', format: [ 'bold', 'italic' ] }, // due to priority this will never be used
        { start: '', end: 'brb', cmd: 'mceInsertContent', value: 'be right back' },
        { start: 'irl', end: '', cmd: 'mceInsertContent', value: 'in real life' },
        { start: 'asap', replacement: 'as soon as possible' }
      ]
  };
  const inlinePatterns = Settings.getPatternSet(mockEditor as any).inlinePatterns;

  const getInlinePattern = (editor: Editor, patterns: InlinePattern[], space: boolean = false) =>
    findPatterns(editor, patterns, space);

  const assertPatterns = (actualMatches: InlinePatternMatch[], expectedMatches: ExpectedPatternMatch[]) => {
    assert.lengthOf(actualMatches, expectedMatches.length, 'Pattern count does not match');
    for (let i = 0; i < expectedMatches.length; i++) {
      const expected = expectedMatches[i];
      const actual = actualMatches[i];
      const pattern = actual.pattern;
      Obj.each(expected.pattern, (value, key) => {
        if (Obj.has<any, string>(pattern, key)) {
          assert.deepEqual(pattern[key], value, 'Pattern ' + (i + 1) + ' property `' + key + '` is not equal');
        } else {
          assert.fail('Pattern ' + (i + 1) + ' property `' + key + '` is missing');
        }
      });
      // prepend a 0 because we always add a root node
      assert.deepEqual(actual.startRng.start, [ 0 ].concat(expected.startRng.start), 'start range - start path does not match');
      assert.deepEqual(actual.startRng.end, [ 0 ].concat(expected.startRng.end), 'start range - end path does not match');
      assert.deepEqual(actual.endRng.start, [ 0 ].concat(expected.endRng.start), 'end range - start path does not match');
      assert.deepEqual(actual.endRng.end, [ 0 ].concat(expected.endRng.end), 'end range - end path does not match');
    }
  };

  const assertSimpleMatch = (actualMatches: InlinePatternMatch[], matchStart: string, matchEnd: string, formats: string[], startRng: PathRange, endRng: PathRange) =>
    assertPatterns(actualMatches, [{ pattern: { start: matchStart, end: matchEnd, format: formats }, startRng, endRng }]);

  const setContentAndCursor = (editor: Editor, content: string, elementPath: number[], offset: number) => {
    editor.setContent(`<div>${content}</div>`, { format: 'raw' });
    TinySelections.setCursor(editor, [ 0 ].concat(elementPath), offset);
  };

  const setContentAndSelection = (editor: Editor, content: string, startPath: number[], soffset: number, finishPath: number[], foffset: number) => {
    editor.setContent(`<div>${content}</div>`, { format: 'raw' });
    TinySelections.setSelection(editor, [ 0 ].concat(startPath), soffset, [ 0 ].concat(finishPath), foffset);
  };

  it('TBA: Run on text without pattern returns no matching patterns', () => {
    const editor = hook.editor();
    setContentAndCursor(editor, 'text', [ 0 ], 4);
    const matches = getInlinePattern(editor, inlinePatterns);
    assertPatterns(matches, []);
  });

  it('TBA: Run on range that is not on a text node without pattern returns no match', () => {
    const editor = hook.editor();
    setContentAndCursor(editor, '<p>text</p>', [ 0 ], 1);
    const matches = getInlinePattern(editor, inlinePatterns);
    assertPatterns(matches, []);
  });

  it('TBA: Run on range that is not on a text node with pattern returns a match', () => {
    const editor = hook.editor();
    setContentAndCursor(editor, '<p>*a*</p>', [ 0 ], 1);
    const matches = getInlinePattern(editor, inlinePatterns);
    assertSimpleMatch(matches, '*', '*', [ 'italic' ], { start: [ 0, 0, 0 ], end: [ 0, 0, 1 ] }, { start: [ 0, 0, 2 ], end: [ 0, 0, 3 ] });
  });

  it('TBA: inline * pattern with no gap to matching token returns no match', () => {
    const editor = hook.editor();
    setContentAndCursor(editor, '*x***', [ 0 ], 5);
    const matches = getInlinePattern(editor, inlinePatterns);
    assertPatterns(matches, []);
  });

  it('TBA: inline * with uncollapsed range returns no match', () => {
    const editor = hook.editor();
    setContentAndSelection(editor, '*x*&nbsp;', [ 0 ], 3, [ 0 ], 4);
    const matches = getInlinePattern(editor, inlinePatterns, true);
    assertPatterns(matches, []);
  });

  it('TBA: inline * pattern end without content returns no match', () => {
    const editor = hook.editor();
    setContentAndCursor(editor, '**', [ 0 ], 2);
    const matches = getInlinePattern(editor, inlinePatterns);
    assertPatterns(matches, []);
  });

  it('TBA: inline * and ** end pattern without start pattern no match', () => {
    const editor = hook.editor();
    setContentAndCursor(editor, '***', [ 0 ], 3);
    const matches = getInlinePattern(editor, inlinePatterns);
    assertPatterns(matches, []);
  });

  it('TBA: cursor in middle of pattern returns no match', () => {
    const editor = hook.editor();
    setContentAndCursor(editor, '*** x***', [ 0 ], 4);
    const matches = getInlinePattern(editor, inlinePatterns, true);
    assertPatterns(matches, []);
  });

  it('TBA: inline * without content before or after', () => {
    const editor = hook.editor();
    setContentAndCursor(editor, '*x*', [ 0 ], 3);
    const matches = getInlinePattern(editor, inlinePatterns);
    assertSimpleMatch(matches, '*', '*', [ 'italic' ], { start: [ 0, 0 ], end: [ 0, 1 ] }, { start: [ 0, 2 ], end: [ 0, 3 ] });
  });

  it('TBA: inline * with content before', () => {
    const editor = hook.editor();
    setContentAndCursor(editor, 'a *x*', [ 0 ], 5);
    const matches = getInlinePattern(editor, inlinePatterns);
    assertSimpleMatch(matches, '*', '*', [ 'italic' ], { start: [ 0, 2 ], end: [ 0, 3 ] }, { start: [ 0, 4 ], end: [ 0, 5 ] });
  });

  it('TBA: inline * with content before and after', () => {
    const editor = hook.editor();
    setContentAndCursor(editor, 'a *x* b', [ 0 ], 5);
    const matches = getInlinePattern(editor, inlinePatterns);
    assertSimpleMatch(matches, '*', '*', [ 'italic' ], { start: [ 0, 2 ], end: [ 0, 3 ] }, { start: [ 0, 4 ], end: [ 0, 5 ] });
  });

  it('TBA: inline * with content before and after, with space', () => {
    const editor = hook.editor();
    setContentAndCursor(editor, '***x* **', [ 0 ], 6);
    const matches = getInlinePattern(editor, inlinePatterns, true);
    assertSimpleMatch(matches, '*', '*', [ 'italic' ], { start: [ 0, 2 ], end: [ 0, 3 ] }, { start: [ 0, 4 ], end: [ 0, 5 ] });
  });

  it('TBA: inline ** without content before or after', () => {
    const editor = hook.editor();
    setContentAndCursor(editor, '**x**', [ 0 ], 5);
    const matches = getInlinePattern(editor, inlinePatterns);
    assertSimpleMatch(matches, '**', '**', [ 'bold' ], { start: [ 0, 0 ], end: [ 0, 2 ] }, { start: [ 0, 3 ], end: [ 0, 5 ] });
  });

  it('TBA: inline ** with content before', () => {
    const editor = hook.editor();
    setContentAndCursor(editor, 'a **x**', [ 0 ], 7);
    const matches = getInlinePattern(editor, inlinePatterns);
    assertSimpleMatch(matches, '**', '**', [ 'bold' ], { start: [ 0, 2 ], end: [ 0, 4 ] }, { start: [ 0, 5 ], end: [ 0, 7 ] });
  });

  it('TBA: inline ** with content before and after', () => {
    const editor = hook.editor();
    setContentAndCursor(editor, 'a **x** b', [ 0 ], 7);
    const matches = getInlinePattern(editor, inlinePatterns);
    assertSimpleMatch(matches, '**', '**', [ 'bold' ], { start: [ 0, 2 ], end: [ 0, 4 ] }, { start: [ 0, 5 ], end: [ 0, 7 ] });
  });

  it('TBA: inline * and ** without content before or after', () => {
    const editor = hook.editor();
    setContentAndCursor(editor, '***x***', [ 0 ], 7);
    const matches = getInlinePattern(editor, inlinePatterns);
    assertPatterns(matches, [
      { pattern: { start: '**', end: '**', format: [ 'bold' ] }, startRng: { start: [ 0, 1 ], end: [ 0, 3 ] }, endRng: { start: [ 0, 4 ], end: [ 0, 6 ] }},
      { pattern: { start: '*', end: '*', format: [ 'italic' ] }, startRng: { start: [ 0, 0 ], end: [ 0, 1 ] }, endRng: { start: [ 0, 6 ], end: [ 0, 7 ] }}
    ]);
  });

  it('TBA: inline * and ** with content before', () => {
    const editor = hook.editor();
    setContentAndCursor(editor, 'a ***x***', [ 0 ], 9);
    const matches = getInlinePattern(editor, inlinePatterns);
    assertPatterns(matches, [
      { pattern: { start: '**', end: '**', format: [ 'bold' ] }, startRng: { start: [ 0, 3 ], end: [ 0, 5 ] }, endRng: { start: [ 0, 6 ], end: [ 0, 8 ] }},
      { pattern: { start: '*', end: '*', format: [ 'italic' ] }, startRng: { start: [ 0, 2 ], end: [ 0, 3 ] }, endRng: { start: [ 0, 8 ], end: [ 0, 9 ] }}
    ]);
  });

  it('TBA: inline * and ** with content before and after', () => {
    const editor = hook.editor();
    setContentAndCursor(editor, 'a ***x*** b', [ 0 ], 9);
    const matches = getInlinePattern(editor, inlinePatterns);
    assertPatterns(matches, [
      { pattern: { start: '**', end: '**', format: [ 'bold' ] }, startRng: { start: [ 0, 3 ], end: [ 0, 5 ] }, endRng: { start: [ 0, 6 ], end: [ 0, 8 ] }},
      { pattern: { start: '*', end: '*', format: [ 'italic' ] }, startRng: { start: [ 0, 2 ], end: [ 0, 3 ] }, endRng: { start: [ 0, 8 ], end: [ 0, 9 ] }}
    ]);
  });

  it('TBA: force only ** pattern and test return on not existing *** pattern', () => {
    const editor = hook.editor();
    setContentAndCursor(editor, '***x***', [ 0 ], 7);
    const matches = getInlinePattern(editor, [{ type: 'inline-format', start: '**', end: '**', format: [ 'bold' ] }]);
    assertSimpleMatch(matches, '**', '**', [ 'bold' ], { start: [ 0, 1 ], end: [ 0, 3 ] }, { start: [ 0, 5 ], end: [ 0, 7 ] });
  });

  it('TBA: force only ** pattern with leading content and test return on not existing *** pattern', () => {
    const editor = hook.editor();
    setContentAndCursor(editor, 'y ***x***', [ 0 ], 9);
    const matches = getInlinePattern(editor, [{ type: 'inline-format', start: '**', end: '**', format: [ 'bold' ] }]);
    assertSimpleMatch(matches, '**', '**', [ 'bold' ], { start: [ 0, 3 ], end: [ 0, 5 ] }, { start: [ 0, 7 ], end: [ 0, 9 ] });
  });

  it('TBA: force only ** pattern with trailing ** text and test return on not existing *** pattern', () => {
    const editor = hook.editor();
    setContentAndCursor(editor, 'y ***x*** **', [ 0 ], 9);
    const matches = getInlinePattern(editor, [{ type: 'inline-format', start: '**', end: '**', format: [ 'bold' ] }]);
    assertSimpleMatch(matches, '**', '**', [ 'bold' ], { start: [ 0, 3 ], end: [ 0, 5 ] }, { start: [ 0, 7 ], end: [ 0, 9 ] });
  });

  it('TBA: Check match when input pattern has an empty start value', () => {
    const editor = hook.editor();
    setContentAndCursor(editor, 'brb', [ 0 ], 3);
    const matches = getInlinePattern(editor, inlinePatterns);
    assertPatterns(matches, [
      { pattern: { start: '', end: 'brb', value: 'be right back' }, startRng: { start: [ 0, 0 ], end: [ 0, 3 ] }, endRng: { start: [ 0, 0 ], end: [ 0, 3 ] }}
    ]);
  });

  it('TBA: Check match when input pattern has an empty end value', () => {
    const editor = hook.editor();
    setContentAndCursor(editor, 'irl', [ 0 ], 3);
    const matches = getInlinePattern(editor, inlinePatterns);
    assertPatterns(matches, [
      { pattern: { start: '', end: 'irl', value: 'in real life' }, startRng: { start: [ 0, 0 ], end: [ 0, 3 ] }, endRng: { start: [ 0, 0 ], end: [ 0, 3 ] }}
    ]);
  });

  it('TBA: Check match when input pattern uses replacement syntax', () => {
    const editor = hook.editor();
    setContentAndCursor(editor, 'asap', [ 0 ], 4);
    const matches = getInlinePattern(editor, inlinePatterns);
    assertPatterns(matches, [
      { pattern: { start: '', end: 'asap', value: 'as soon as possible' }, startRng: { start: [ 0, 0 ], end: [ 0, 4 ] }, endRng: { start: [ 0, 0 ], end: [ 0, 4 ] }}
    ]);
  });

  it('TBA: Check nested match', () => {
    const editor = hook.editor();
    setContentAndCursor(editor, 'Bring those reports ***asap***!', [ 0 ], 31);
    const matches = getInlinePattern(editor, inlinePatterns, true);
    assertPatterns(matches, [
      { pattern: { start: '', end: 'asap', value: 'as soon as possible' }, startRng: { start: [ 0, 23 ], end: [ 0, 27 ] }, endRng: { start: [ 0, 23 ], end: [ 0, 27 ] }},
      { pattern: { start: '**', end: '**', format: [ 'bold' ] }, startRng: { start: [ 0, 21 ], end: [ 0, 23 ] }, endRng: { start: [ 0, 27 ], end: [ 0, 29 ] }},
      { pattern: { start: '*', end: '*', format: [ 'italic' ] }, startRng: { start: [ 0, 20 ], end: [ 0, 21 ] }, endRng: { start: [ 0, 29 ], end: [ 0, 30 ] }}
    ]);
  });

  it('TBA: Check that a pattern will be matched across tag boundaries', () => {
    const editor = hook.editor();
    setContentAndCursor(editor, '<span>*text</span><span>*</span>', [ 1, 0 ], 1);
    const matches = getInlinePattern(editor, inlinePatterns);
    assertPatterns(matches, [
      { pattern: { start: '*', end: '*', format: [ 'italic' ] }, startRng: { start: [ 0, 0, 0 ], end: [ 0, 0, 1 ] }, endRng: { start: [ 1, 0, 0 ], end: [ 1, 0, 1 ] }}
    ]);
  });

  it('TBA: Check that a pattern will be matched across tag boundaries 2', () => {
    const editor = hook.editor();
    setContentAndCursor(editor, '<span>**text*</span><span>*</span>', [ 1, 0 ], 1);
    const matches = getInlinePattern(editor, inlinePatterns);
    assertPatterns(matches, [
      { pattern: { start: '**', end: '**', format: [ 'bold' ] }, startRng: { start: [ 0, 0, 0 ], end: [ 0, 0, 2 ] }, endRng: { start: [ 0, 0, 6 ], end: [ 1, 0, 1 ] }}
    ]);
  });

  it('TBA: Check that a pattern will not be matched across block boundaries', () => {
    const editor = hook.editor();
    setContentAndCursor(editor, '<p>*text</p><p>*</p>', [ 1, 0 ], 1);
    const matches = getInlinePattern(editor, inlinePatterns);
    assertPatterns(matches, []);
  });

  it('TBA: Check that a pattern will not be matched across block boundaries 2', () => {
    const editor = hook.editor();
    setContentAndCursor(editor, '<p>*text</p><span>*</span>', [ 1, 0 ], 1);
    const matches = getInlinePattern(editor, inlinePatterns);
    assertPatterns(matches, []);
  });
});
