import { context, describe, it } from '@ephox/bedrock-client';
import { Obj } from '@ephox/katamari';
import { TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import * as InlinePattern from 'tinymce/core/textpatterns/core/InlinePattern';
import {
  DynamicPatternContext, InlinePattern as InlinePatternType, InlinePatternMatch, PatternSet
} from 'tinymce/core/textpatterns/core/PatternTypes';
import { PathRange } from 'tinymce/core/textpatterns/utils/PathRange';
import { getBeforeText, getParentBlock, resolveFromDynamicPatterns } from 'tinymce/core/textpatterns/utils/Utils';
import ListsPlugin from 'tinymce/plugins/lists/Plugin';

import { getPatternSetFor } from '../../module/test/TextPatternsUtils';

describe('browser.tinymce.textpatterns.FindInlinePatternTest', () => {
  interface ExpectedPatternMatch {
    readonly pattern: Partial<InlinePatternType>;
    readonly startRng: PathRange;
    readonly endRng: PathRange;
  }

  const assertPatterns = (actualMatches: InlinePatternMatch[], expectedMatches: ExpectedPatternMatch[]) => {
    assert.lengthOf(actualMatches, expectedMatches.length, 'Pattern count does not match');
    for (let i = 0; i < expectedMatches.length; i++) {
      const expected = expectedMatches[i];
      const actual = actualMatches[i];
      const pattern = actual.pattern as Record<string, any>;
      Obj.each(expected.pattern, (value, key) => {
        if (Obj.has(pattern, key)) {
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

  const getInlinePattern = (editor: Editor, patternSet: PatternSet, space: boolean = false, normalized: boolean = false) => getParentBlock(editor, editor.selection.getRng()).map((block) => {
    const rng = editor.selection.getRng();
    const offset = Math.max(0, rng.startOffset - (space ? 1 : 0));
    const beforeText = getBeforeText(editor.dom, block, rng.startContainer, offset);
    const dynamicPatternSet = resolveFromDynamicPatterns(patternSet, block, beforeText);
    return InlinePattern.findPatterns(editor, block, rng.startContainer, offset, dynamicPatternSet, normalized);
  }).getOr([]);

  context('no text_patterns_lookup', () => {
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

    const getInlinePatternSet = getPatternSetFor(hook);

    it('TINY-8778: Run on text without pattern returns no matching patterns', () => {
      const editor = hook.editor();
      setContentAndCursor(editor, 'text', [ 0 ], 4);
      const matches = getInlinePattern(editor, getInlinePatternSet());
      assertPatterns(matches, []);
    });

    it('TINY-8778: Run on range that is not on a text node without pattern returns no match', () => {
      const editor = hook.editor();
      setContentAndCursor(editor, '<p>text</p>', [ 0 ], 1);
      const matches = getInlinePattern(editor, getInlinePatternSet());
      assertPatterns(matches, []);
    });

    it('TINY-8778: Run on range that is not on a text node with pattern returns a match', () => {
      const editor = hook.editor();
      setContentAndCursor(editor, '<p>*a*</p>', [ 0 ], 1);
      const matches = getInlinePattern(editor, getInlinePatternSet());
      assertSimpleMatch(matches, '*', '*', [ 'italic' ], { start: [ 0, 0, 0 ], end: [ 0, 0, 1 ] }, { start: [ 0, 0, 2 ], end: [ 0, 0, 3 ] });
    });

    it('TINY-8778: inline * with uncollapsed range returns no match', () => {
      const editor = hook.editor();
      setContentAndSelection(editor, '*x*&nbsp;', [ 0 ], 3, [ 0 ], 4);
      const matches = getInlinePattern(editor, getInlinePatternSet(), true);
      assertPatterns(matches, []);
    });

    it('TINY-8778: inline * pattern end without content returns no match', () => {
      const editor = hook.editor();
      setContentAndCursor(editor, '**', [ 0 ], 2);
      const matches = getInlinePattern(editor, getInlinePatternSet());
      assertPatterns(matches, []);
    });

    it('TINY-8778: inline * and ** end pattern without start pattern no match', () => {
      const editor = hook.editor();
      setContentAndCursor(editor, '***', [ 0 ], 3);
      const matches = getInlinePattern(editor, getInlinePatternSet());
      assertPatterns(matches, []);
    });

    it('TINY-8778: cursor in middle of pattern returns no match', () => {
      const editor = hook.editor();
      setContentAndCursor(editor, '*** x***', [ 0 ], 4);
      const matches = getInlinePattern(editor, getInlinePatternSet(), true);
      assertPatterns(matches, []);
    });

    it('TINY-8778: inline * without content before or after', () => {
      const editor = hook.editor();
      setContentAndCursor(editor, '*x*', [ 0 ], 3);
      const matches = getInlinePattern(editor, getInlinePatternSet());
      assertSimpleMatch(matches, '*', '*', [ 'italic' ], { start: [ 0, 0 ], end: [ 0, 1 ] }, { start: [ 0, 2 ], end: [ 0, 3 ] });
    });

    it('TINY-8778: inline * with content before', () => {
      const editor = hook.editor();
      setContentAndCursor(editor, 'a *x*', [ 0 ], 5);
      const matches = getInlinePattern(editor, getInlinePatternSet());
      assertSimpleMatch(matches, '*', '*', [ 'italic' ], { start: [ 0, 2 ], end: [ 0, 3 ] }, { start: [ 0, 4 ], end: [ 0, 5 ] });
    });

    it('TINY-8778: inline * with content before and after', () => {
      const editor = hook.editor();
      setContentAndCursor(editor, 'a *x* b', [ 0 ], 5);
      const matches = getInlinePattern(editor, getInlinePatternSet());
      assertSimpleMatch(matches, '*', '*', [ 'italic' ], { start: [ 0, 2 ], end: [ 0, 3 ] }, { start: [ 0, 4 ], end: [ 0, 5 ] });
    });

    it('TINY-8778: inline * with content before and after, with space', () => {
      const editor = hook.editor();
      setContentAndCursor(editor, '***x* **', [ 0 ], 6);
      const matches = getInlinePattern(editor, getInlinePatternSet(), true);
      assertSimpleMatch(matches, '*', '*', [ 'italic' ], { start: [ 0, 2 ], end: [ 0, 3 ] }, { start: [ 0, 4 ], end: [ 0, 5 ] });
    });

    it('TINY-8778: inline ** without content before or after', () => {
      const editor = hook.editor();
      setContentAndCursor(editor, '**x**', [ 0 ], 5);
      const matches = getInlinePattern(editor, getInlinePatternSet());
      assertSimpleMatch(matches, '**', '**', [ 'bold' ], { start: [ 0, 0 ], end: [ 0, 2 ] }, { start: [ 0, 3 ], end: [ 0, 5 ] });
    });

    it('TINY-8778: inline ** with content before', () => {
      const editor = hook.editor();
      setContentAndCursor(editor, 'a **x**', [ 0 ], 7);
      const matches = getInlinePattern(editor, getInlinePatternSet());
      assertSimpleMatch(matches, '**', '**', [ 'bold' ], { start: [ 0, 2 ], end: [ 0, 4 ] }, { start: [ 0, 5 ], end: [ 0, 7 ] });
    });

    it('TINY-8778: inline ** with content before and after', () => {
      const editor = hook.editor();
      setContentAndCursor(editor, 'a **x** b', [ 0 ], 7);
      const matches = getInlinePattern(editor, getInlinePatternSet());
      assertSimpleMatch(matches, '**', '**', [ 'bold' ], { start: [ 0, 2 ], end: [ 0, 4 ] }, { start: [ 0, 5 ], end: [ 0, 7 ] });
    });

    it('TINY-8778: inline * and ** without content before or after', () => {
      const editor = hook.editor();
      setContentAndCursor(editor, '***x***', [ 0 ], 7);
      const matches = getInlinePattern(editor, getInlinePatternSet());
      assertPatterns(matches, [
        { pattern: { start: '**', end: '**', format: [ 'bold' ] }, startRng: { start: [ 0, 1 ], end: [ 0, 3 ] }, endRng: { start: [ 0, 4 ], end: [ 0, 6 ] }},
        { pattern: { start: '*', end: '*', format: [ 'italic' ] }, startRng: { start: [ 0, 0 ], end: [ 0, 1 ] }, endRng: { start: [ 0, 6 ], end: [ 0, 7 ] }}
      ]);
    });

    it('TINY-8778: inline * and ** with content before', () => {
      const editor = hook.editor();
      setContentAndCursor(editor, 'a ***x***', [ 0 ], 9);
      const matches = getInlinePattern(editor, getInlinePatternSet());
      assertPatterns(matches, [
        { pattern: { start: '**', end: '**', format: [ 'bold' ] }, startRng: { start: [ 0, 3 ], end: [ 0, 5 ] }, endRng: { start: [ 0, 6 ], end: [ 0, 8 ] }},
        { pattern: { start: '*', end: '*', format: [ 'italic' ] }, startRng: { start: [ 0, 2 ], end: [ 0, 3 ] }, endRng: { start: [ 0, 8 ], end: [ 0, 9 ] }}
      ]);
    });

    it('TINY-8778: inline * and ** with content before and after', () => {
      const editor = hook.editor();
      setContentAndCursor(editor, 'a ***x*** b', [ 0 ], 9);
      const matches = getInlinePattern(editor, getInlinePatternSet());
      assertPatterns(matches, [
        { pattern: { start: '**', end: '**', format: [ 'bold' ] }, startRng: { start: [ 0, 3 ], end: [ 0, 5 ] }, endRng: { start: [ 0, 6 ], end: [ 0, 8 ] }},
        { pattern: { start: '*', end: '*', format: [ 'italic' ] }, startRng: { start: [ 0, 2 ], end: [ 0, 3 ] }, endRng: { start: [ 0, 8 ], end: [ 0, 9 ] }}
      ]);
    });

    context('with just a single ** -> bold inline-format pattern', () => {
      const inlinePatternSet: PatternSet = {
        blockPatterns: [],
        inlinePatterns: [
          { type: 'inline-format', start: '**', end: '**', format: [ 'bold' ] }
        ],
        dynamicPatternsLookup: () => []
      };

      it('TINY-8778: force only ** pattern and test return on not existing *** pattern', () => {
        const editor = hook.editor();
        setContentAndCursor(editor, '***x***', [ 0 ], 7);
        const matches = getInlinePattern(editor, inlinePatternSet);
        assertSimpleMatch(matches, '**', '**', [ 'bold' ], { start: [ 0, 1 ], end: [ 0, 3 ] }, { start: [ 0, 5 ], end: [ 0, 7 ] });
      });

      it('TINY-8778: force only ** pattern with leading content and test return on not existing *** pattern', () => {
        const editor = hook.editor();
        setContentAndCursor(editor, 'y ***x***', [ 0 ], 9);
        const matches = getInlinePattern(editor, inlinePatternSet);
        assertSimpleMatch(matches, '**', '**', [ 'bold' ], { start: [ 0, 3 ], end: [ 0, 5 ] }, { start: [ 0, 7 ], end: [ 0, 9 ] });
      });

      it('TINY-8778: force only ** pattern with trailing ** text and test return on not existing *** pattern', () => {
        const editor = hook.editor();
        setContentAndCursor(editor, 'y ***x*** **', [ 0 ], 9);
        const matches = getInlinePattern(editor, inlinePatternSet);
        assertSimpleMatch(matches, '**', '**', [ 'bold' ], { start: [ 0, 3 ], end: [ 0, 5 ] }, { start: [ 0, 7 ], end: [ 0, 9 ] });
      });
    });

    it('TINY-8778: Check match when input pattern has an empty start value', () => {
      const editor = hook.editor();
      setContentAndCursor(editor, 'brb', [ 0 ], 3);
      const matches = getInlinePattern(editor, getInlinePatternSet());
      assertPatterns(matches, [
        { pattern: { start: '', end: 'brb', value: 'be right back' }, startRng: { start: [ 0, 0 ], end: [ 0, 3 ] }, endRng: { start: [ 0, 0 ], end: [ 0, 3 ] }}
      ]);
    });

    it('TINY-8778: Check match when input pattern has an empty end value', () => {
      const editor = hook.editor();
      setContentAndCursor(editor, 'irl', [ 0 ], 3);
      const matches = getInlinePattern(editor, getInlinePatternSet());
      assertPatterns(matches, [
        { pattern: { start: '', end: 'irl', value: 'in real life' }, startRng: { start: [ 0, 0 ], end: [ 0, 3 ] }, endRng: { start: [ 0, 0 ], end: [ 0, 3 ] }}
      ]);
    });

    it('TINY-8778: Check match when input pattern uses replacement syntax', () => {
      const editor = hook.editor();
      setContentAndCursor(editor, 'asap', [ 0 ], 4);
      const matches = getInlinePattern(editor, getInlinePatternSet());
      assertPatterns(matches, [
        { pattern: { start: '', end: 'asap', value: 'as soon as possible' }, startRng: { start: [ 0, 0 ], end: [ 0, 4 ] }, endRng: { start: [ 0, 0 ], end: [ 0, 4 ] }}
      ]);
    });

    it('TINY-8778: Check nested match', () => {
      const editor = hook.editor();
      setContentAndCursor(editor, 'Bring those reports ***asap***!', [ 0 ], 31);
      const matches = getInlinePattern(editor, getInlinePatternSet(), true);
      assertPatterns(matches, [
        { pattern: { start: '', end: 'asap', value: 'as soon as possible' }, startRng: { start: [ 0, 23 ], end: [ 0, 27 ] }, endRng: { start: [ 0, 23 ], end: [ 0, 27 ] }},
        { pattern: { start: '**', end: '**', format: [ 'bold' ] }, startRng: { start: [ 0, 21 ], end: [ 0, 23 ] }, endRng: { start: [ 0, 27 ], end: [ 0, 29 ] }},
        { pattern: { start: '*', end: '*', format: [ 'italic' ] }, startRng: { start: [ 0, 20 ], end: [ 0, 21 ] }, endRng: { start: [ 0, 29 ], end: [ 0, 30 ] }}
      ]);
    });

    it('TINY-8778: Check that a pattern will be matched across tag boundaries', () => {
      const editor = hook.editor();
      setContentAndCursor(editor, '<span>*text</span><span>*</span>', [ 1, 0 ], 1);
      const matches = getInlinePattern(editor, getInlinePatternSet());
      assertPatterns(matches, [
        { pattern: { start: '*', end: '*', format: [ 'italic' ] }, startRng: { start: [ 0, 0, 0 ], end: [ 0, 0, 1 ] }, endRng: { start: [ 1, 0, 0 ], end: [ 1, 0, 1 ] }}
      ]);
    });

    it('TINY-8778: Check that a pattern will be matched across tag boundaries 2', () => {
      const editor = hook.editor();
      setContentAndCursor(editor, '<span>**text*</span><span>*</span>', [ 1, 0 ], 1);
      const matches = getInlinePattern(editor, getInlinePatternSet());
      assertPatterns(matches, [
        { pattern: { start: '**', end: '**', format: [ 'bold' ] }, startRng: { start: [ 0, 0, 0 ], end: [ 0, 0, 2 ] }, endRng: { start: [ 0, 0, 6 ], end: [ 1, 0, 1 ] }}
      ]);
    });

    it('TINY-8778: Check that a pattern will not be matched across block boundaries', () => {
      const editor = hook.editor();
      setContentAndCursor(editor, '<p>*text</p><p>*</p>', [ 1, 0 ], 1);
      const matches = getInlinePattern(editor, getInlinePatternSet());
      assertPatterns(matches, []);
    });

    it('TINY-8778: Check that a pattern will not be matched across block boundaries 2', () => {
      const editor = hook.editor();
      setContentAndCursor(editor, '<p>*text</p><span>*</span>', [ 1, 0 ], 1);
      const matches = getInlinePattern(editor, getInlinePatternSet());
      assertPatterns(matches, []);
    });
  });

  context('with text_patterns_lookup', () => {
    const hook = TinyHooks.bddSetupLight<Editor>({
      text_patterns: [
        { start: '*', end: '*', format: 'italic' }
      ],
      text_patterns_lookup: (ctx: DynamicPatternContext) => {
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
        } else if (parentTag === 'div' && ctx.text.endsWith('replace-me')) {

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

    const getInlinePatternSet = getPatternSetFor(hook);

    it('TINY-8778: Code Pattern only runs on with code blocks', () => {
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

    it('TINY-8778: Code Pattern does not run with paragraph blocks', () => {
      const editor = hook.editor();
      editor.setContent('<p>`const`</p>');
      TinySelections.setCursor(editor, [ 0, 0 ], '`const`'.length);
      const matches = getInlinePattern(editor, getInlinePatternSet(), false);
      assertPatterns(matches, []);
    });

    it('TINY-8778: Inline patterns still work when lookup defined', () => {
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

    it('TINY-8778: Inline pattern lookups take precedence over inline patterns', () => {
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

    it('TINY-8778: Inline pattern lookups based on non-matching context text', () => {
      const editor = hook.editor();
      editor.setContent('<div>keep-me</div>');
      TinySelections.setCursor(editor, [ 0, 0 ], 'keep-me'.length);
      const matches = getInlinePattern(editor, getInlinePatternSet(), false);
      assertPatterns(matches, []);
    });

    it('TINY-8778: Inline pattern lookups based on matching context text', () => {
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

    it('TINY-8778: Inline pattern matches text in the middle of a pagraph', () => {
      const editor = hook.editor();
      editor.setContent('<div>Should replace-me in the middle of paragraph</div>');
      TinySelections.setCursor(editor, [ 0, 0 ], 'Should replace-me'.length);
      const matches = getInlinePattern(editor, getInlinePatternSet(), false);
      assertPatterns(
        matches,
        [
          {
            // assertCall prepends an 0
            startRng: {
              start: [ 0, 'Should replace-'.length ],
              end: [ 0, 'Should replace-me'.length ]
            },
            endRng: {
              start: [ 0, 'Should replace-'.length ],
              end: [ 0, 'Should replace-me'.length ]
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

    it('TINY-8778: Does not return a match if the text pattern is not at the cursor', () => {
      const editor = hook.editor();
      const content = 'Should not match becauce replace-me is not at the cursor';
      editor.setContent(`<div>${content}</div>`);
      TinySelections.setCursor(editor, [ 0, 0 ], content.length);
      const matches = getInlinePattern(editor, getInlinePatternSet(), false);
      assertPatterns(
        matches,
        []
      );
    });
  });
});
