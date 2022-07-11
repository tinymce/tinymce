import { describe, it } from '@ephox/bedrock-client';
import { Obj, Thunk } from '@ephox/katamari';
import { TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import * as Options from 'tinymce/core/api/Options';
import * as InlinePattern from 'tinymce/core/textpatterns/core/InlinePattern';
import * as Pattern from 'tinymce/core/textpatterns/core/Pattern';
import { InlinePattern as InlinePatternType, InlinePatternMatch, InlinePatternSet } from 'tinymce/core/textpatterns/core/PatternTypes';
import { PathRange } from 'tinymce/core/textpatterns/utils/PathRange';
import ListsPlugin from 'tinymce/plugins/lists/Plugin';

interface ExpectedPatternMatch {
  readonly pattern: Partial<InlinePatternType>;
  readonly startRng: PathRange;
  readonly endRng: PathRange;
}

const getInlinePatternSetFor = (hook: TinyHooks.Hook<Editor>) => Thunk.cached((): InlinePatternSet => {
  const editor = hook.editor();
  const rawPatterns = Options.getTextPatterns(editor);
  const dynamicPatternsLookup = Options.getTextPatternsLookup(editor);
  const { blockPatterns, ...inlinePatternSet } = Pattern.createPatternSet(
    Pattern.fromRawPatterns(rawPatterns),
    dynamicPatternsLookup
  );
  return inlinePatternSet;
});

const getInlinePattern = (editor: Editor, patternSet: InlinePatternSet, space: boolean = false) =>
  InlinePattern.findPatterns(editor, patternSet, space);

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

const setContentAndCursor = (editor: Editor, content: string, elementPath: number[], offset: number) => {
  editor.setContent(`<div>${content}</div>`, { format: 'raw' });
  TinySelections.setCursor(editor, [ 0 ].concat(elementPath), offset);
};

const setContentAndSelection = (editor: Editor, content: string, startPath: number[], soffset: number, finishPath: number[], foffset: number) => {
  editor.setContent(`<div>${content}</div>`, { format: 'raw' });
  TinySelections.setSelection(editor, [ 0 ].concat(startPath), soffset, [ 0 ].concat(finishPath), foffset);
};

const assertSimpleMatch = (actualMatches: InlinePatternMatch[], matchStart: string, matchEnd: string, formats: string[], startRng: PathRange, endRng: PathRange) =>
  assertPatterns(actualMatches, [{ pattern: { start: matchStart, end: matchEnd, format: formats }, startRng, endRng }]);

describe('browser.tinymce.core.textpatterns.FindInlinePatternTest', () => {

  describe('no text_patterns_lookup', () => {
    const hook = TinyHooks.bddSetupLight<Editor>({
      plugins: 'lists',
      text_patterns: [
        { start: '*', end: '*', format: 'italic' },
        { start: '**', end: '**', format: 'bold' },
        { start: '***', end: '***', format: [ 'bold', 'italic' ] }, // due to priority this will never be used
        { start: '', end: 'brb', cmd: 'mceInsertContent', value: 'be right back' },
        { start: 'irl', end: '', cmd: 'mceInsertContent', value: 'in real life' },
        { start: 'asap', replacement: 'as soon as possible' }
      ],
      base_url: '/project/tinymce/js/tinymce'
    }, [ ListsPlugin ]);

    const getInlinePatternSet = getInlinePatternSetFor(hook);

    it('TBA: Run on text without pattern returns no matching patterns', () => {
      const editor = hook.editor();
      setContentAndCursor(editor, 'text', [ 0 ], 4);
      const matches = getInlinePattern(editor, getInlinePatternSet());
      assertPatterns(matches, []);
    });

    it('TBA: Run on range that is not on a text node without pattern returns no match', () => {
      const editor = hook.editor();
      setContentAndCursor(editor, '<p>text</p>', [ 0 ], 1);
      const matches = getInlinePattern(editor, getInlinePatternSet());
      assertPatterns(matches, []);
    });

    it('TBA: Run on range that is not on a text node with pattern returns a match', () => {
      const editor = hook.editor();
      setContentAndCursor(editor, '<p>*a*</p>', [ 0 ], 1);
      const matches = getInlinePattern(editor, getInlinePatternSet());
      assertSimpleMatch(matches, '*', '*', [ 'italic' ], { start: [ 0, 0, 0 ], end: [ 0, 0, 1 ] }, { start: [ 0, 0, 2 ], end: [ 0, 0, 3 ] });
    });

    it('TBA: inline * pattern with no gap to matching token returns no match', () => {
      const editor = hook.editor();
      setContentAndCursor(editor, '*x***', [ 0 ], 5);
      const matches = getInlinePattern(editor, getInlinePatternSet());
      assertPatterns(matches, []);
    });

    it('TBA: inline * with uncollapsed range returns no match', () => {
      const editor = hook.editor();
      setContentAndSelection(editor, '*x*&nbsp;', [ 0 ], 3, [ 0 ], 4);
      const matches = getInlinePattern(editor, getInlinePatternSet(), true);
      assertPatterns(matches, []);
    });

    it('TBA: inline * pattern end without content returns no match', () => {
      const editor = hook.editor();
      setContentAndCursor(editor, '**', [ 0 ], 2);
      const matches = getInlinePattern(editor, getInlinePatternSet());
      assertPatterns(matches, []);
    });

    it('TBA: inline * and ** end pattern without start pattern no match', () => {
      const editor = hook.editor();
      setContentAndCursor(editor, '***', [ 0 ], 3);
      const matches = getInlinePattern(editor, getInlinePatternSet());
      assertPatterns(matches, []);
    });

    it('TBA: cursor in middle of pattern returns no match', () => {
      const editor = hook.editor();
      setContentAndCursor(editor, '*** x***', [ 0 ], 4);
      const matches = getInlinePattern(editor, getInlinePatternSet(), true);
      assertPatterns(matches, []);
    });

    it('TBA: inline * without content before or after', () => {
      const editor = hook.editor();
      setContentAndCursor(editor, '*x*', [ 0 ], 3);
      const matches = getInlinePattern(editor, getInlinePatternSet());
      assertSimpleMatch(matches, '*', '*', [ 'italic' ], { start: [ 0, 0 ], end: [ 0, 1 ] }, { start: [ 0, 2 ], end: [ 0, 3 ] });
    });

    it('TBA: inline * with content before', () => {
      const editor = hook.editor();
      setContentAndCursor(editor, 'a *x*', [ 0 ], 5);
      const matches = getInlinePattern(editor, getInlinePatternSet());
      assertSimpleMatch(matches, '*', '*', [ 'italic' ], { start: [ 0, 2 ], end: [ 0, 3 ] }, { start: [ 0, 4 ], end: [ 0, 5 ] });
    });

    it('TBA: inline * with content before and after', () => {
      const editor = hook.editor();
      setContentAndCursor(editor, 'a *x* b', [ 0 ], 5);
      const matches = getInlinePattern(editor, getInlinePatternSet());
      assertSimpleMatch(matches, '*', '*', [ 'italic' ], { start: [ 0, 2 ], end: [ 0, 3 ] }, { start: [ 0, 4 ], end: [ 0, 5 ] });
    });

    it('TBA: inline * with content before and after, with space', () => {
      const editor = hook.editor();
      setContentAndCursor(editor, '***x* **', [ 0 ], 6);
      const matches = getInlinePattern(editor, getInlinePatternSet(), true);
      assertSimpleMatch(matches, '*', '*', [ 'italic' ], { start: [ 0, 2 ], end: [ 0, 3 ] }, { start: [ 0, 4 ], end: [ 0, 5 ] });
    });

    it('TBA: inline ** without content before or after', () => {
      const editor = hook.editor();
      setContentAndCursor(editor, '**x**', [ 0 ], 5);
      const matches = getInlinePattern(editor, getInlinePatternSet());
      assertSimpleMatch(matches, '**', '**', [ 'bold' ], { start: [ 0, 0 ], end: [ 0, 2 ] }, { start: [ 0, 3 ], end: [ 0, 5 ] });
    });

    it('TBA: inline ** with content before', () => {
      const editor = hook.editor();
      setContentAndCursor(editor, 'a **x**', [ 0 ], 7);
      const matches = getInlinePattern(editor, getInlinePatternSet());
      assertSimpleMatch(matches, '**', '**', [ 'bold' ], { start: [ 0, 2 ], end: [ 0, 4 ] }, { start: [ 0, 5 ], end: [ 0, 7 ] });
    });

    it('TBA: inline ** with content before and after', () => {
      const editor = hook.editor();
      setContentAndCursor(editor, 'a **x** b', [ 0 ], 7);
      const matches = getInlinePattern(editor, getInlinePatternSet());
      assertSimpleMatch(matches, '**', '**', [ 'bold' ], { start: [ 0, 2 ], end: [ 0, 4 ] }, { start: [ 0, 5 ], end: [ 0, 7 ] });
    });

    it('TBA: inline * and ** without content before or after', () => {
      const editor = hook.editor();
      setContentAndCursor(editor, '***x***', [ 0 ], 7);
      const matches = getInlinePattern(editor, getInlinePatternSet());
      assertPatterns(matches, [
        { pattern: { start: '**', end: '**', format: [ 'bold' ] }, startRng: { start: [ 0, 1 ], end: [ 0, 3 ] }, endRng: { start: [ 0, 4 ], end: [ 0, 6 ] }},
        { pattern: { start: '*', end: '*', format: [ 'italic' ] }, startRng: { start: [ 0, 0 ], end: [ 0, 1 ] }, endRng: { start: [ 0, 6 ], end: [ 0, 7 ] }}
      ]);
    });

    it('TBA: inline * and ** with content before', () => {
      const editor = hook.editor();
      setContentAndCursor(editor, 'a ***x***', [ 0 ], 9);
      const matches = getInlinePattern(editor, getInlinePatternSet());
      assertPatterns(matches, [
        { pattern: { start: '**', end: '**', format: [ 'bold' ] }, startRng: { start: [ 0, 3 ], end: [ 0, 5 ] }, endRng: { start: [ 0, 6 ], end: [ 0, 8 ] }},
        { pattern: { start: '*', end: '*', format: [ 'italic' ] }, startRng: { start: [ 0, 2 ], end: [ 0, 3 ] }, endRng: { start: [ 0, 8 ], end: [ 0, 9 ] }}
      ]);
    });

    it('TBA: inline * and ** with content before and after', () => {
      const editor = hook.editor();
      setContentAndCursor(editor, 'a ***x*** b', [ 0 ], 9);
      const matches = getInlinePattern(editor, getInlinePatternSet());
      assertPatterns(matches, [
        { pattern: { start: '**', end: '**', format: [ 'bold' ] }, startRng: { start: [ 0, 3 ], end: [ 0, 5 ] }, endRng: { start: [ 0, 6 ], end: [ 0, 8 ] }},
        { pattern: { start: '*', end: '*', format: [ 'italic' ] }, startRng: { start: [ 0, 2 ], end: [ 0, 3 ] }, endRng: { start: [ 0, 8 ], end: [ 0, 9 ] }}
      ]);
    });

    describe('with just a single ** -> bold inline-format pattern', () => {
      const inlinePatternSet: InlinePatternSet = {
        inlinePatterns: [
          { type: 'inline-format', start: '**', end: '**', format: [ 'bold' ] }
        ],
        dynamicPatternsLookup: () => []
      };

      it('TBA: force only ** pattern and test return on not existing *** pattern', () => {
        const editor = hook.editor();
        setContentAndCursor(editor, '***x***', [ 0 ], 7);
        const matches = getInlinePattern(editor, inlinePatternSet);
        assertSimpleMatch(matches, '**', '**', [ 'bold' ], { start: [ 0, 1 ], end: [ 0, 3 ] }, { start: [ 0, 5 ], end: [ 0, 7 ] });
      });

      it('TBA: force only ** pattern with leading content and test return on not existing *** pattern', () => {
        const editor = hook.editor();
        setContentAndCursor(editor, 'y ***x***', [ 0 ], 9);
        const matches = getInlinePattern(editor, inlinePatternSet);
        assertSimpleMatch(matches, '**', '**', [ 'bold' ], { start: [ 0, 3 ], end: [ 0, 5 ] }, { start: [ 0, 7 ], end: [ 0, 9 ] });
      });

      it('TBA: force only ** pattern with trailing ** text and test return on not existing *** pattern', () => {
        const editor = hook.editor();
        setContentAndCursor(editor, 'y ***x*** **', [ 0 ], 9);
        const matches = getInlinePattern(editor, inlinePatternSet);
        assertSimpleMatch(matches, '**', '**', [ 'bold' ], { start: [ 0, 3 ], end: [ 0, 5 ] }, { start: [ 0, 7 ], end: [ 0, 9 ] });
      });
    });

    it('TBA: Check match when input pattern has an empty start value', () => {
      const editor = hook.editor();
      setContentAndCursor(editor, 'brb', [ 0 ], 3);
      const matches = getInlinePattern(editor, getInlinePatternSet());
      assertPatterns(matches, [
        { pattern: { start: '', end: 'brb', value: 'be right back' }, startRng: { start: [ 0, 0 ], end: [ 0, 3 ] }, endRng: { start: [ 0, 0 ], end: [ 0, 3 ] }}
      ]);
    });

    it('TBA: Check match when input pattern has an empty end value', () => {
      const editor = hook.editor();
      setContentAndCursor(editor, 'irl', [ 0 ], 3);
      const matches = getInlinePattern(editor, getInlinePatternSet());
      assertPatterns(matches, [
        { pattern: { start: '', end: 'irl', value: 'in real life' }, startRng: { start: [ 0, 0 ], end: [ 0, 3 ] }, endRng: { start: [ 0, 0 ], end: [ 0, 3 ] }}
      ]);
    });

    it('TBA: Check match when input pattern uses replacement syntax', () => {
      const editor = hook.editor();
      setContentAndCursor(editor, 'asap', [ 0 ], 4);
      const matches = getInlinePattern(editor, getInlinePatternSet());
      assertPatterns(matches, [
        { pattern: { start: '', end: 'asap', value: 'as soon as possible' }, startRng: { start: [ 0, 0 ], end: [ 0, 4 ] }, endRng: { start: [ 0, 0 ], end: [ 0, 4 ] }}
      ]);
    });

    it('TBA: Check nested match', () => {
      const editor = hook.editor();
      setContentAndCursor(editor, 'Bring those reports ***asap***!', [ 0 ], 31);
      const matches = getInlinePattern(editor, getInlinePatternSet(), true);
      assertPatterns(matches, [
        { pattern: { start: '', end: 'asap', value: 'as soon as possible' }, startRng: { start: [ 0, 23 ], end: [ 0, 27 ] }, endRng: { start: [ 0, 23 ], end: [ 0, 27 ] }},
        { pattern: { start: '**', end: '**', format: [ 'bold' ] }, startRng: { start: [ 0, 21 ], end: [ 0, 23 ] }, endRng: { start: [ 0, 27 ], end: [ 0, 29 ] }},
        { pattern: { start: '*', end: '*', format: [ 'italic' ] }, startRng: { start: [ 0, 20 ], end: [ 0, 21 ] }, endRng: { start: [ 0, 29 ], end: [ 0, 30 ] }}
      ]);
    });

    it('TBA: Check that a pattern will be matched across tag boundaries', () => {
      const editor = hook.editor();
      setContentAndCursor(editor, '<span>*text</span><span>*</span>', [ 1, 0 ], 1);
      const matches = getInlinePattern(editor, getInlinePatternSet());
      assertPatterns(matches, [
        { pattern: { start: '*', end: '*', format: [ 'italic' ] }, startRng: { start: [ 0, 0, 0 ], end: [ 0, 0, 1 ] }, endRng: { start: [ 1, 0, 0 ], end: [ 1, 0, 1 ] }}
      ]);
    });

    it('TBA: Check that a pattern will be matched across tag boundaries 2', () => {
      const editor = hook.editor();
      setContentAndCursor(editor, '<span>**text*</span><span>*</span>', [ 1, 0 ], 1);
      const matches = getInlinePattern(editor, getInlinePatternSet());
      assertPatterns(matches, [
        { pattern: { start: '**', end: '**', format: [ 'bold' ] }, startRng: { start: [ 0, 0, 0 ], end: [ 0, 0, 2 ] }, endRng: { start: [ 0, 0, 6 ], end: [ 1, 0, 1 ] }}
      ]);
    });

    it('TBA: Check that a pattern will not be matched across block boundaries', () => {
      const editor = hook.editor();
      setContentAndCursor(editor, '<p>*text</p><p>*</p>', [ 1, 0 ], 1);
      const matches = getInlinePattern(editor, getInlinePatternSet());
      assertPatterns(matches, []);
    });

    it('TBA: Check that a pattern will not be matched across block boundaries 2', () => {
      const editor = hook.editor();
      setContentAndCursor(editor, '<p>*text</p><span>*</span>', [ 1, 0 ], 1);
      const matches = getInlinePattern(editor, getInlinePatternSet());
      assertPatterns(matches, []);
    });
  });

  describe('with text_patterns_lookup', () => {
    const hook = TinyHooks.bddSetupLight<Editor>({
      text_patterns: [
        { start: '*', end: '*', format: 'italic' }
      ],
      text_patterns_lookup: (ctx) => {
        const parentTag = ctx.block.nodeName.toLowerCase();
        if (parentTag === 'pre') {
          return [
            {
              start: '`', end: '`', format: 'code'
            }
          ];
        } else if (parentTag === 'p') {
          return [
            {
              start: '*', end: '*', format: 'bold'
            }
          ];
        } else if (parentTag === 'div' && ctx.text === 'replace-me') {
          return [
            {
              start: 'me', replacement: 'you'
            }
          ];
        } else {
          return [];
        }
      },
      base_url: '/project/tinymce/js/tinymce'
    }, []);

    const getInlinePatternSet = getInlinePatternSetFor(hook);

    it('TBA: Code Pattern only runs on with code blocks', () => {
      const editor = hook.editor();
      editor.setContent('<pre>`const`</pre>');
      TinySelections.setCursor(editor, [ 0, 0 ], '`const`'.length);
      const matches = getInlinePattern(editor, getInlinePatternSet(), false);
      assertSimpleMatch(
        matches, '`', '`', [ 'code' ],
        // assertCall prepends an 0
        { start: [ 0, 0 ], end: [ 0, '`'.length ] },
        { start: [ 0, '`const'.length ], end: [ 0, '`const`'.length ] }
      );
    });

    it('TBA: Code Pattern does not run with paragraph blocks', () => {
      const editor = hook.editor();
      editor.setContent('<p>`const`</p>');
      TinySelections.setCursor(editor, [ 0, 0 ], '`const`'.length);
      const matches = getInlinePattern(editor, getInlinePatternSet(), false);
      assertPatterns(matches, []);
    });

    it('TBA: Inline patterns still work when lookup defined', () => {
      const editor = hook.editor();
      editor.setContent('<pre>*const*</pre>');
      TinySelections.setCursor(editor, [ 0, 0 ], '*const*'.length);
      const matches = getInlinePattern(editor, getInlinePatternSet(), false);
      assertSimpleMatch(
        matches, '*', '*', [ 'italic' ],
        // assertCall prepends an 0
        { start: [ 0, 0 ], end: [ 0, '`'.length ] },
        { start: [ 0, '*const'.length ], end: [ 0, '*const*'.length ] }
      );
    });

    it('TBA: Inline pattern lookups take precedence over inline patterns', () => {
      const editor = hook.editor();
      editor.setContent('<p>*const*</p>');
      TinySelections.setCursor(editor, [ 0, 0 ], '*const*'.length);
      const matches = getInlinePattern(editor, getInlinePatternSet(), false);
      assertSimpleMatch(
        matches, '*', '*', [ 'bold' ],
        // assertCall prepends an 0
        { start: [ 0, 0 ], end: [ 0, '`'.length ] },
        { start: [ 0, '*const'.length ], end: [ 0, '*const*'.length ] }
      );
    });

    it('TBA: Inline pattern lookups based on non-matching context text', () => {
      const editor = hook.editor();
      editor.setContent('<div>keep-me</div>');
      TinySelections.setCursor(editor, [ 0, 0 ], 'keep-me'.length);
      const matches = getInlinePattern(editor, getInlinePatternSet(), false);
      assertPatterns(matches, []);
    });

    it('TBA: Inline pattern lookups based on matching context text', () => {
      const editor = hook.editor();
      editor.setContent('<div>replace-me</div>');
      TinySelections.setCursor(editor, [ 0, 0 ], 'replace-me'.length);
      const matches = getInlinePattern(editor, getInlinePatternSet(), false);
      assertPatterns(
        matches,
        [
          {
            // assertCall prepends an 0
            startRng: {
              start: [ 0, 'replace-'.length ],
              end: [ 0, 'replace-me'.length ]
            },
            endRng: {
              start: [ 0, 'replace-'.length ],
              end: [ 0, 'replace-me'.length ]
            },
            pattern: {
              type: 'inline-command',
              cmd: 'mceInsertContent',
              value: 'you'
            }
          }
        ]
      );
    });
  });
});
