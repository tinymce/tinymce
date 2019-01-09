import { Assertions, Chain, Pipeline, Step } from '@ephox/agar';
import { UnitTest, assert } from '@ephox/bedrock';

import * as Settings from 'tinymce/plugins/textpattern/api/Settings';
import { document, Range, Node, HTMLElement } from '@ephox/dom-globals';
import { InlinePatternMatch, findNestedInlinePatterns } from '../../../main/ts/core/FindPatterns';
import { Obj, Arr, Type } from '@ephox/katamari';
import { InlinePattern } from '../../../main/ts/api/Pattern';
import DOMUtils from '../../../../../core/main/ts/api/dom/DOMUtils';
import { PlatformDetection } from '@ephox/sand';

UnitTest.asynctest('textpattern.browser.FindInlinePatternTest', (success, failure) => {

  const inlinePatterns = Settings.getPatternSet({textpattern_patterns: [
    { start: '*', end: '*', format: 'italic' },
    { start: '**', end: '**', format: 'bold' },
    { start: '***', end: '***', format: ['bold', 'italic'] }, // due to priority this will never be used
    { start: '', end: 'brb', cmd: 'mceInsertContent', value: 'be right back'},
    { start: 'irl', end: '', cmd: 'mceInsertContent', value: 'in real life'},
    { start: 'asap', replacement: 'as soon as possible'}
  ]}).inlinePatterns;

  interface HtmlItem {
    n: string;
    cs: Array<HtmlItem | string>;
  }

  const createComplex = function (item: HtmlItem | string): Node {
    if (Type.isString(item)) {
      return document.createTextNode(item);
    } else {
      const i = document.createElement(item.n);
      Arr.each(item.cs, (child) => {
        i.appendChild(createComplex(child));
      });
      return i;
    }
  };

  const createComplexRng = (n: HtmlItem | string, startPos: number[], endPos: number[]): {root: HTMLElement, range: Range} => {
    const root = document.createElement('div');
    const ele = createComplex(n);
    root.appendChild(ele);
    const select = (node: Node, pos: number[]) => pos.length === 0 ? node : select(node.childNodes[pos[0]], pos.slice(1));
    const startOffset = startPos.pop();
    const start = select(ele, startPos);
    const endOffset = endPos.pop();
    const end = select(ele, endPos);
    const range = document.createRange();
    range.setStart(start, startOffset);
    range.setEnd(end, endOffset);
    return { root, range };
  };

  const createRng = function (text: string, startOffset: number, endOffset: number) {
    return createComplexRng(text, [startOffset], [endOffset]);
  };

  const cGetInlinePattern = function (patterns: InlinePattern[], space: boolean) {
    const asStr = (p: InlinePattern) => {
      if (p.type === 'inline-format') {
        return p.start + 'TEXT' + p.end + ' = ' + JSON.stringify(p.format);
      } else {
        const m = (p.start === '' || p.end === '') ? p.start + p.end : p.start + 'TEXT' + p.end;
        return m + ' = ' + p.cmd + '(' + JSON.stringify(p.value) + ')';
      }
    };

    return Chain.label('Get inline ' + Arr.map(patterns, asStr).join(', '),
      Chain.mapper<{root: HTMLElement, range: Range}, InlinePatternMatch[]>(function (input) {
        const dom = DOMUtils(input.root.ownerDocument, { root_element: input.root });
        return findNestedInlinePatterns(dom, patterns, input.range, space);
      })
    );
  };

  interface ExpectedPatternMatch {
    pattern: Partial<{
      start: string;
      end: string;
      format: string[];
      cmd: string;
      value: any;
    }>;
    start: number[];
    end: number[];
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
        Assertions.assertEq('start path does not match', [0].concat(expected.start), actual.range.start);
        Assertions.assertEq('end path does not match', [0].concat(expected.end), actual.range.end);
      }
    });
  };

  const cAssertSimpleMatch = function (matchStart: string, matchEnd: string, formats: string[], startPath: number[], endPath: number[]) {
    return cAssertPatterns([{pattern: {start: matchStart, end: matchEnd, format: formats}, start: startPath, end: endPath}]);
  };

  const browser = PlatformDetection.detect().browser;

  Pipeline.async({}, [
    Step.label('Run on text without pattern returns no matching patterns', Chain.asStep(
      createRng('text', 4, 4),
      [
        cGetInlinePattern(inlinePatterns, false),
        cAssertPatterns([])
      ]
    )),
    Step.label('Run on range that is not on a text node without pattern returns no match', Chain.asStep(
      createComplexRng({n: 'p', cs: ['text']}, [1], [1]),
      [
        cGetInlinePattern(inlinePatterns, false),
        cAssertPatterns([])
      ]
    )),
    // IE mutates the range so the start container is inside the paragraph
    // leaving the end on the paragraph, this results in the range not being
    // collapsed which causes the test to fail, unless you print the range
    // and startContainer to the console in which case it mutates both the start
    // and end of the range to point at the text node inside the paragraph and passes...
    // I am not sure how to test a collapsed range not directly on a text node in IE.
    browser.isIE() ? Step.pass :
    Step.label('Run on range that is not on a text node with pattern returns a match', Chain.asStep(
      createComplexRng({n: 'p', cs: ['*a*']}, [1], [1]),
      [
        cGetInlinePattern(inlinePatterns, false),
        cAssertSimpleMatch('*', '*', ['italic'], [0, 0], [0, 3])
      ]
    )),
    Step.label('inline * pattern with no gap to matching token returns no match', Chain.asStep(createRng('*x***', 5, 5), [
      cGetInlinePattern(inlinePatterns, false),
      cAssertPatterns([])
    ])),
    Step.label('inline * with uncollapsed range returns no match', Chain.asStep(createRng('*x* ', 3, 4), [
      cGetInlinePattern(inlinePatterns, false),
      cAssertPatterns([])
    ])),
    Step.label('inline * pattern end without content returns no match', Chain.asStep(createRng('**', 2, 2), [
      cGetInlinePattern(inlinePatterns, false),
      cAssertPatterns([])
    ])),
    Step.label('inline * and ** end pattern without start pattern no match', Chain.asStep(createRng('***', 3, 3), [
      cGetInlinePattern(inlinePatterns, false),
      cAssertPatterns([])
    ])),
    Step.label('cursor in middle of pattern returns no match', Chain.asStep(createRng('*** x***', 4, 4), [
      cGetInlinePattern(inlinePatterns, true),
      cAssertPatterns([])
    ])),

    Step.label('inline * without content before or after', Chain.asStep(createRng('*x*', 3, 3), [
      cGetInlinePattern(inlinePatterns, false),
      cAssertSimpleMatch('*', '*', ['italic'], [0], [3])
    ])),
    Step.label('inline * with content before', Chain.asStep(createRng('a *x*', 5, 5), [
      cGetInlinePattern(inlinePatterns, false),
      cAssertSimpleMatch('*', '*', ['italic'], [2], [5])
    ])),
    Step.label('inline * with content before and after', Chain.asStep(createRng('a *x* b', 5, 5), [
      cGetInlinePattern(inlinePatterns, false),
      cAssertSimpleMatch('*', '*', ['italic'], [2], [5])
    ])),
    Step.label('inline * with content before and after, with space', Chain.asStep(createRng('***x* **', 6, 6), [
      cGetInlinePattern(inlinePatterns, true),
      cAssertSimpleMatch('*', '*', ['italic'], [2], [5])
    ])),
    Step.label('inline ** without content before or after', Chain.asStep(createRng('**x**', 5, 5), [
      cGetInlinePattern(inlinePatterns, false),
      cAssertSimpleMatch('**', '**', ['bold'], [0], [5])
    ])),
    Step.label('inline ** with content before', Chain.asStep(createRng('a **x**', 7, 7), [
      cGetInlinePattern(inlinePatterns, false),
      cAssertSimpleMatch('**', '**', ['bold'], [2], [7])
    ])),
    Step.label('inline ** with content before and after', Chain.asStep(createRng('a **x** b', 7, 7), [
      cGetInlinePattern(inlinePatterns, false),
      cAssertSimpleMatch('**', '**', ['bold'], [2], [7])
    ])),
    Step.label('inline * and ** without content before or after', Chain.asStep(createRng('***x***', 7, 7), [
      cGetInlinePattern(inlinePatterns, false),
      cAssertPatterns([
        {pattern: {start: '**', end: '**', format: ['bold']}, start: [1], end: [6]},
        {pattern: {start: '*', end: '*', format: ['italic']}, start: [0], end: [7]}
      ])
    ])),
    Step.label('inline * and ** with content before', Chain.asStep(createRng('a ***x***', 9, 9), [
      cGetInlinePattern(inlinePatterns, false),
      cAssertPatterns([
        {pattern: {start: '**', end: '**', format: ['bold']}, start: [3], end: [8]},
        {pattern: {start: '*', end: '*', format: ['italic']}, start: [2], end: [9]}
      ])
    ])),
    Step.label('inline * and ** with content before and after', Chain.asStep(createRng('a ***x*** b', 9, 9), [
      cGetInlinePattern(inlinePatterns, false),
      cAssertPatterns([
        {pattern: {start: '**', end: '**', format: ['bold']}, start: [3], end: [8]},
        {pattern: {start: '*', end: '*', format: ['italic']}, start: [2], end: [9]}
      ])
    ])),
    Step.label('force only ** pattern and test return on not existing *** pattern', Chain.asStep(createRng('***x***', 7, 7), [
      cGetInlinePattern([{ type: 'inline-format', start: '**', end: '**', format: ['bold'] }], false),
      cAssertSimpleMatch('**', '**', ['bold'], [1], [7])
    ])),
    Step.label('force only ** pattern and test return on not existing *** pattern', Chain.asStep(createRng('y ***x***', 9, 9), [
      cGetInlinePattern([{ type: 'inline-format',  start: '**', end: '**', format: ['bold'] }], false),
      cAssertSimpleMatch('**', '**', ['bold'], [3], [9])
    ])),
    Step.label('force only ** pattern and test return on not existing *** pattern', Chain.asStep(createRng('y ***x*** **', 9, 9), [
      cGetInlinePattern([{ type: 'inline-format',  start: '**', end: '**', format: ['bold'] }], false),
      cAssertSimpleMatch('**', '**', ['bold'], [3], [9])
    ])),
    Step.label('Check match when input pattern has an empty start value', Chain.asStep(
      createRng('brb', 3, 3),
      [
        cGetInlinePattern(inlinePatterns, false),
        cAssertPatterns([
          {pattern: {start: '', end: 'brb', value: 'be right back'}, start: [0], end: [3]}
        ])
      ]
    )),
    Step.label('Check match when input pattern has an empty end value', Chain.asStep(
      createRng('irl', 3, 3),
      [
        cGetInlinePattern(inlinePatterns, false),
        cAssertPatterns([
          {pattern: {start: '', end: 'irl', value: 'in real life'}, start: [0], end: [3]}
        ])
      ]
    )),
    Step.label('Check match when input pattern uses replacement syntax', Chain.asStep(
      createRng('asap', 4, 4),
      [
        cGetInlinePattern(inlinePatterns, false),
        cAssertPatterns([
          {pattern: {start: '', end: 'asap', value: 'as soon as possible'}, start: [0], end: [4]}
        ])
      ]
    )),
    Step.label('Check nested match', Chain.asStep(
      createRng('Bring those reports ***asap***!', 31, 31),
      [
        cGetInlinePattern(inlinePatterns, true),
        cAssertPatterns([
          {pattern: {start: '', end: 'asap', value: 'as soon as possible'}, start: [23], end: [27]},
          {pattern: {start: '**', end: '**', format: ['bold']}, start: [21], end: [29]},
          {pattern: {start: '*', end: '*', format: ['italic']}, start: [20], end: [30]}
        ])
      ]
    )),
    Step.label('Check that a pattern will be matched across text boundaries', Chain.asStep(
      createComplexRng({n: 'p', cs: ['*text', '*']}, [1, 1], [1, 1]),
      [
        cGetInlinePattern(inlinePatterns, false),
        cAssertPatterns([
          {pattern: {start: '*', end: '*', format: ['italic']}, start: [0, 0], end: [1, 1]}
        ])
      ]
    )),
    Step.label('Check that a pattern will be matched across tag boundaries', Chain.asStep(
      createComplexRng({n: 'p', cs: [{n: 'span', cs: ['*text']}, {n: 'span', cs: ['*']}]}, [1, 0, 1], [1, 0, 1]),
      [
        cGetInlinePattern(inlinePatterns, false),
        cAssertPatterns([
          {pattern: {start: '*', end: '*', format: ['italic']}, start: [0, 0, 0], end: [1, 0, 1]}
        ])
      ]
    )),
    Step.label('Check that a pattern will not be matched across block boundaries', Chain.asStep(
      createComplexRng({n: 'div', cs: [{n: 'p', cs: ['*text']}, {n: 'p', cs: ['*']}]}, [1, 0, 1], [1, 0, 1]),
      [
        cGetInlinePattern(inlinePatterns, false),
        cAssertPatterns([
        ])
      ]
    )),
    Step.label('Check that a pattern will not be matched across block boundaries 2', Chain.asStep(
      createComplexRng({n: 'div', cs: [{n: 'p', cs: ['*text']}, {n: 'span', cs: ['*']}]}, [1, 0, 1], [1, 0, 1]),
      [
        cGetInlinePattern(inlinePatterns, false),
        cAssertPatterns([
        ])
      ]
    ))
  ], function () {
    success();
  }, failure);
});
