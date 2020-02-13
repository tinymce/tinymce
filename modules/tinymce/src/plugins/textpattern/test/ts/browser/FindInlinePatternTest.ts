import { Assertions, Chain, GeneralSteps, Log, Pipeline } from '@ephox/agar';
import { UnitTest, assert } from '@ephox/bedrock-client';
import { Obj, Arr } from '@ephox/katamari';
import { TinyApis, TinyLoader } from '@ephox/mcagar';

import Editor from 'tinymce/core/api/Editor';
import * as Settings from 'tinymce/plugins/textpattern/api/Settings';
import { findPatterns } from 'tinymce/plugins/textpattern/core/InlinePattern';
import { InlinePattern, InlinePatternMatch } from 'tinymce/plugins/textpattern/core/PatternTypes';
import { PathRange } from 'tinymce/plugins/textpattern/utils/PathRange';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('textpattern.browser.FindInlinePatternTest', (success, failure) => {
  Theme();

  const inlinePatterns = Settings.getPatternSet({textpattern_patterns: [
    { start: '*', end: '*', format: 'italic' },
    { start: '**', end: '**', format: 'bold' },
    { start: '***', end: '***', format: ['bold', 'italic'] }, // due to priority this will never be used
    { start: '', end: 'brb', cmd: 'mceInsertContent', value: 'be right back'},
    { start: 'irl', end: '', cmd: 'mceInsertContent', value: 'in real life'},
    { start: 'asap', replacement: 'as soon as possible'}
  ]}).inlinePatterns;

  const cGetInlinePattern = function (patterns: InlinePattern[], space: boolean = false) {
    const asStr = (p: InlinePattern) => {
      if (p.type === 'inline-format') {
        return p.start + 'TEXT' + p.end + ' = ' + JSON.stringify(p.format);
      } else {
        const m = (p.start === '' || p.end === '') ? p.start + p.end : p.start + 'TEXT' + p.end;
        return m + ' = ' + p.cmd + '(' + JSON.stringify(p.value) + ')';
      }
    };

    return Chain.label('Get inline ' + Arr.map(patterns, asStr).join(', '),
      Chain.mapper<Editor, InlinePatternMatch[]>(function (editor) {
        return findPatterns(editor, patterns, space);
      })
    );
  };

  interface ExpectedPatternMatch {
    pattern: Partial<InlinePattern>;
    startRng: PathRange;
    endRng: PathRange;
  }

  const cAssertPatterns = function (expectedMatches: ExpectedPatternMatch[]) {
    return Chain.op<InlinePatternMatch[]>((actualMatches) => {
      Assertions.assertEq('Pattern count does not match', expectedMatches.length, actualMatches.length);
      for (let i = 0; i < expectedMatches.length; i++) {
        const expected = expectedMatches[i];
        const actual = actualMatches[i];
        const pattern = actual.pattern;
        Obj.each(expected.pattern, (value, key) => {
          if (Obj.has<any, string>(pattern, key)) {
            Assertions.assertEq('Pattern ' + (i + 1) + ' property `' + key + '` is not equal', value, pattern[key]);
          } else {
            assert.fail('Pattern ' + (i + 1) + ' property `' + key + '` is missing');
          }
        });
        // prepend a 0 because we always add a root node
        Assertions.assertEq('start range - start path does not match', [0].concat(expected.startRng.start), actual.startRng.start);
        Assertions.assertEq('start range - end path does not match', [0].concat(expected.startRng.end), actual.startRng.end);
        Assertions.assertEq('end range - start path does not match', [0].concat(expected.endRng.start), actual.endRng.start);
        Assertions.assertEq('end range - end path does not match', [0].concat(expected.endRng.end), actual.endRng.end);
      }
    });
  };

  const cAssertSimpleMatch = function (matchStart: string, matchEnd: string, formats: string[], startRng: PathRange, endRng: PathRange) {
    return cAssertPatterns([{pattern: {start: matchStart, end: matchEnd, format: formats}, startRng, endRng}]);
  };

  TinyLoader.setupLight((editor, onSuccess, onFailure) => {
    const tinyApis = TinyApis(editor);

    const sSetContentAndCursor = (content: string, elementPath: number[], offset: number) => {
      return GeneralSteps.sequence([
        tinyApis.sSetRawContent(`<div>${content}</div>`),
        tinyApis.sSetCursor([0].concat(elementPath), offset),
      ]);
    };

    const sSetContentAndSelection = (content: string, startPath: number[], soffset: number, finishPath: number[], foffset: number) => {
      return GeneralSteps.sequence([
        tinyApis.sSetRawContent(`<div>${content}</div>`),
        tinyApis.sSetSelection([0].concat(startPath), soffset, [0].concat(finishPath), foffset),
      ]);
    };

    Pipeline.async({}, [
      Log.stepsAsStep('TBA', 'Run on text without pattern returns no matching patterns', [
        sSetContentAndCursor('text', [0], 4),
        Chain.asStep(editor, [
          cGetInlinePattern(inlinePatterns),
          cAssertPatterns([])
        ])
      ]),
      Log.stepsAsStep('TBA', 'Run on range that is not on a text node without pattern returns no match', [
        sSetContentAndCursor('<p>text</p>', [0], 1),
        Chain.asStep(editor, [
          cGetInlinePattern(inlinePatterns),
          cAssertPatterns([])
        ])
      ]),
      Log.stepsAsStep('TBA', 'Run on range that is not on a text node with pattern returns a match', [
        sSetContentAndCursor('<p>*a*</p>', [0], 1),
        Chain.asStep(editor, [
          cGetInlinePattern(inlinePatterns),
          cAssertSimpleMatch('*', '*', ['italic'], { start: [0, 0, 0], end: [0, 0, 1] }, { start: [0, 0, 2], end: [0, 0, 3] })
        ])
      ]),
      Log.stepsAsStep('TBA', 'inline * pattern with no gap to matching token returns no match', [
        sSetContentAndCursor('*x***', [0], 5),
        Chain.asStep(editor, [
          cGetInlinePattern(inlinePatterns),
          cAssertPatterns([])
        ])
      ]),
      Log.stepsAsStep('TBA', 'inline * with uncollapsed range returns no match', [
        sSetContentAndSelection('*x*&nbsp;', [0], 3,  [0], 4),
        Chain.asStep(editor, [
          cGetInlinePattern(inlinePatterns, true),
          cAssertPatterns([])
        ])
      ]),
      Log.stepsAsStep('TBA', 'inline * pattern end without content returns no match', [
        sSetContentAndCursor('**', [0], 2),
        Chain.asStep(editor, [
          cGetInlinePattern(inlinePatterns),
          cAssertPatterns([])
        ])
      ]),
      Log.stepsAsStep('TBA', 'inline * and ** end pattern without start pattern no match', [
        sSetContentAndCursor('***', [0], 3),
        Chain.asStep(editor, [
          cGetInlinePattern(inlinePatterns),
          cAssertPatterns([])
        ])
      ]),
      Log.stepsAsStep('TBA', 'cursor in middle of pattern returns no match', [
        sSetContentAndCursor('*** x***', [0], 4),
          Chain.asStep(editor, [
          cGetInlinePattern(inlinePatterns, true),
          cAssertPatterns([])
        ])
      ]),

      Log.stepsAsStep('TBA', 'inline * without content before or after', [
        sSetContentAndCursor('*x*', [0], 3),
        Chain.asStep(editor, [
          cGetInlinePattern(inlinePatterns),
          cAssertSimpleMatch('*', '*', ['italic'], { start: [0, 0], end: [0, 1] }, { start: [0, 2], end: [0, 3] })
        ])
      ]),
      Log.stepsAsStep('TBA', 'inline * with content before', [
        sSetContentAndCursor('a *x*', [0], 5),
        Chain.asStep(editor, [
          cGetInlinePattern(inlinePatterns),
          cAssertSimpleMatch('*', '*', ['italic'], { start: [0, 2], end: [0, 3] }, { start: [0, 4], end: [0, 5] })
        ])
      ]),
      Log.stepsAsStep('TBA', 'inline * with content before and after', [
        sSetContentAndCursor('a *x* b', [0], 5),
        Chain.asStep(editor, [
          cGetInlinePattern(inlinePatterns),
          cAssertSimpleMatch('*', '*', ['italic'], { start: [0, 2], end: [0, 3] }, { start: [0, 4], end: [0, 5] })
        ])
      ]),
      Log.stepsAsStep('TBA', 'inline * with content before and after, with space', [
        sSetContentAndCursor('***x* **', [0], 6),
        Chain.asStep(editor, [
          cGetInlinePattern(inlinePatterns, true),
          cAssertSimpleMatch('*', '*', ['italic'], { start: [0, 2], end: [0, 3] }, { start: [0, 4], end: [0, 5] })
        ])
      ]),
      Log.stepsAsStep('TBA', 'inline ** without content before or after', [
        sSetContentAndCursor('**x**', [0], 5),
        Chain.asStep(editor, [
          cGetInlinePattern(inlinePatterns),
          cAssertSimpleMatch('**', '**', ['bold'], { start: [0, 0], end: [0, 2] }, { start: [0, 3], end: [0, 5] })
        ])
      ]),
      Log.stepsAsStep('TBA', 'inline ** with content before', [
        sSetContentAndCursor('a **x**', [0], 7),
        Chain.asStep(editor, [
          cGetInlinePattern(inlinePatterns),
          cAssertSimpleMatch('**', '**', ['bold'], { start: [0, 2], end: [0, 4]}, { start: [0, 5], end: [0, 7] })
        ])
      ]),
      Log.stepsAsStep('TBA', 'inline ** with content before and after', [
        sSetContentAndCursor('a **x** b', [0], 7),
        Chain.asStep(editor, [
          cGetInlinePattern(inlinePatterns),
          cAssertSimpleMatch('**', '**', ['bold'], { start: [0, 2], end: [0, 4]}, { start: [0, 5], end: [0, 7] })
        ])
      ]),
      Log.stepsAsStep('TBA', 'inline * and ** without content before or after', [
        sSetContentAndCursor('***x***', [0], 7),
        Chain.asStep(editor, [
          cGetInlinePattern(inlinePatterns),
          cAssertPatterns([
            { pattern: { start: '**', end: '**', format: ['bold'] }, startRng: { start: [0, 1], end: [0, 3] }, endRng: { start: [0, 4], end: [0, 6] } },
            { pattern: { start: '*', end: '*', format: ['italic'] }, startRng: { start: [0, 0], end: [0, 1] }, endRng: { start: [0, 6], end: [0, 7] } }
          ])
        ])
      ]),
      Log.stepsAsStep('TBA', 'inline * and ** with content before', [
        sSetContentAndCursor('a ***x***', [0], 9),
        Chain.asStep(editor, [
          cGetInlinePattern(inlinePatterns),
          cAssertPatterns([
            { pattern: { start: '**', end: '**', format: ['bold'] }, startRng: { start: [0, 3], end: [0, 5] }, endRng: { start: [0, 6], end: [0, 8] } },
            { pattern: { start: '*', end: '*', format: ['italic'] }, startRng: { start: [0, 2], end: [0, 3] }, endRng: { start: [0, 8], end: [0, 9] } }
          ])
        ])
      ]),
      Log.stepsAsStep('TBA', 'inline * and ** with content before and after', [
        sSetContentAndCursor('a ***x*** b', [0], 9),
        Chain.asStep(editor, [
          cGetInlinePattern(inlinePatterns),
          cAssertPatterns([
            { pattern: { start: '**', end: '**', format: ['bold'] }, startRng: { start: [0, 3], end: [0, 5] }, endRng: { start: [0, 6], end: [0, 8] } },
            { pattern: { start: '*', end: '*', format: ['italic'] }, startRng: { start: [0, 2], end: [0, 3] }, endRng: { start: [0, 8], end: [0, 9] } }
          ])
        ])
      ]),
      Log.stepsAsStep('TBA', 'force only ** pattern and test return on not existing *** pattern', [
        sSetContentAndCursor('***x***', [0], 7),
        Chain.asStep(editor, [
          cGetInlinePattern([{ type: 'inline-format', start: '**', end: '**', format: ['bold'] }]),
          cAssertSimpleMatch('**', '**', ['bold'], { start: [0, 1], end: [0, 3] }, { start: [0, 5], end: [0, 7] })
        ])
      ]),
      Log.stepsAsStep('TBA', 'force only ** pattern and test return on not existing *** pattern', [
        sSetContentAndCursor('y ***x***', [0], 9),
        Chain.asStep(editor, [
          cGetInlinePattern([{ type: 'inline-format', start: '**', end: '**', format: ['bold'] }]),
          cAssertSimpleMatch('**', '**', ['bold'], { start: [0, 3], end: [0, 5] }, { start: [0, 7], end: [0, 9] })
        ])
      ]),
      Log.stepsAsStep('TBA', 'force only ** pattern and test return on not existing *** pattern', [
        sSetContentAndCursor('y ***x*** **', [0], 9),
        Chain.asStep(editor, [
          cGetInlinePattern([{ type: 'inline-format', start: '**', end: '**', format: ['bold'] }]),
          cAssertSimpleMatch('**', '**', ['bold'], { start: [0, 3], end: [0, 5] }, { start: [0, 7], end: [0, 9] })
        ])
      ]),
      Log.stepsAsStep('TBA', 'Check match when input pattern has an empty start value', [
        sSetContentAndCursor('brb', [0], 3),
        Chain.asStep(editor, [
          cGetInlinePattern(inlinePatterns),
          cAssertPatterns([
            { pattern: { start: '', end: 'brb', value: 'be right back' }, startRng: { start: [0, 0], end: [0, 3] }, endRng: { start: [0, 0], end: [0, 3] } }
          ])
        ])
      ]),
      Log.stepsAsStep('TBA', 'Check match when input pattern has an empty end value', [
        sSetContentAndCursor('irl', [0], 3),
        Chain.asStep(editor, [
          cGetInlinePattern(inlinePatterns),
          cAssertPatterns([
            { pattern: { start: '', end: 'irl', value: 'in real life' }, startRng: { start: [0, 0], end: [0, 3] }, endRng: { start: [0, 0], end: [0, 3] } }
          ])
        ])
      ]),
      Log.stepsAsStep('TBA', 'Check match when input pattern uses replacement syntax', [
        sSetContentAndCursor('asap', [0], 4),
        Chain.asStep(editor, [
          cGetInlinePattern(inlinePatterns),
          cAssertPatterns([
            { pattern: { start: '', end: 'asap', value: 'as soon as possible' }, startRng: { start: [0, 0], end: [0, 4] }, endRng: { start: [0, 0], end: [0, 4] } }
          ])
        ])
      ]),
      Log.stepsAsStep('TBA', 'Check nested match', [
        sSetContentAndCursor('Bring those reports ***asap***!', [0], 31),
        Chain.asStep(editor, [
          cGetInlinePattern(inlinePatterns, true),
          cAssertPatterns([
            { pattern: { start: '', end: 'asap', value: 'as soon as possible' }, startRng: { start: [0, 23], end: [0, 27] }, endRng: { start: [0, 23], end: [0, 27] } },
            { pattern: { start: '**', end: '**', format: ['bold'] }, startRng: { start: [0, 21], end: [0, 23] }, endRng: { start: [0, 27], end: [0, 29] } },
            { pattern: { start: '*', end: '*', format: ['italic'] }, startRng: { start: [0, 20], end: [0, 21] }, endRng: { start: [0, 29], end: [0, 30] } }
          ])
        ])
      ]),
      Log.stepsAsStep('TBA', 'Check that a pattern will be matched across tag boundaries', [
        sSetContentAndCursor('<span>*text</span><span>*</span>', [1, 0], 1),
        Chain.asStep(editor, [
          cGetInlinePattern(inlinePatterns),
          cAssertPatterns([
            { pattern: { start: '*', end: '*', format: ['italic'] }, startRng: { start: [0, 0, 0], end: [0, 0, 1] }, endRng: { start: [1, 0, 0], end: [1, 0, 1] } }
          ])
        ])
      ]),
      Log.stepsAsStep('TBA', 'Check that a pattern will be matched across tag boundaries 2', [
        sSetContentAndCursor('<span>**text*</span><span>*</span>', [1, 0], 1),
        Chain.asStep(editor, [
          cGetInlinePattern(inlinePatterns),
          cAssertPatterns([
            { pattern: { start: '**', end: '**', format: ['bold'] }, startRng: { start: [0, 0, 0], end: [0, 0, 2] }, endRng: { start: [0, 0, 6], end: [1, 0, 1] } }
          ])
        ])
      ]),
      Log.stepsAsStep('TBA', 'Check that a pattern will not be matched across block boundaries', [
        sSetContentAndCursor('<p>*text</p><p>*</p>', [1, 0], 1),
        Chain.asStep(editor, [
          cGetInlinePattern(inlinePatterns),
          cAssertPatterns([])
        ])
      ]),
      Log.stepsAsStep('TBA', 'Check that a pattern will not be matched across block boundaries 2', [
        sSetContentAndCursor('<p>*text</p><span>*</span>', [1, 0], 1),
        Chain.asStep(editor, [
          cGetInlinePattern(inlinePatterns),
          cAssertPatterns([])
        ])
      ])
    ], onSuccess, onFailure);
  }, {
    forced_root_block: false,
    plugins: 'textpattern lists',
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
