import { Assertions, Chain, Logger, Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';

import Settings from 'tinymce/plugins/textpattern/api/Settings';
import Formatter from 'tinymce/plugins/textpattern/core/Formatter';
import { document } from '@ephox/dom-globals';

UnitTest.asynctest('Browser Test: .FormatterTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

  const defaultPatterns = Settings.getPatterns({});

  const createRng = function (text, startOffset, endOffset) {

    const textNode = document.createTextNode(text);
    const rng = document.createRange();
    rng.setStart(textNode, startOffset);
    rng.setEnd(textNode, endOffset);

    return rng;
  };

  const createParagraphElementRng = function (text, startOffset, endOffset) {
    const p = document.createElement('p');
    const textNode = document.createTextNode(text);
    p.appendChild(textNode);
    const rng = document.createRange();
    rng.setStart(p, startOffset);
    rng.setEnd(p, endOffset);

    return rng;
  };

  const cGetInlinePattern = function (patterns, space) {
    return Chain.mapper(function (input) {
      const x = Formatter.patternFromRng(patterns, input, space);

      return x === undefined ? 'undefined' : x;
    });
  };

  Pipeline.async({}, [
    Logger.t('run on text without pattern returns undefined', Chain.asStep(createRng('text', 4, 4), [
      cGetInlinePattern(defaultPatterns, false),
      Assertions.cAssertEq('is undefined', 'undefined')
    ])),
    Logger.t('run on range that is not on a text node without pattern returns undefined', Chain.asStep(
      createParagraphElementRng('text', 1, 1),
      [
        cGetInlinePattern(defaultPatterns, false),
        Assertions.cAssertEq('is undefined', 'undefined')
      ]
    )),
    Logger.t('inline * with uncollapsed range returns undefined', Chain.asStep(createRng('*x***', 5, 5), [
      cGetInlinePattern(defaultPatterns, false),
      Assertions.cAssertEq('is correct pattern and offset', 'undefined')
    ])),
    Logger.t('inline * with uncollapsed range returns undefined', Chain.asStep(createRng('*x* ', 3, 4), [
      cGetInlinePattern(defaultPatterns, false),
      Assertions.cAssertEq('is correct pattern and offset', 'undefined')
    ])),
    Logger.t('pattern without content returns undefined', Chain.asStep(createRng('**', 2, 2), [
      cGetInlinePattern(defaultPatterns, false),
      Assertions.cAssertEq('is correct pattern and offset', 'undefined')
    ])),
    Logger.t('pattern without content returns undefined', Chain.asStep(createRng('***', 3, 3), [
      cGetInlinePattern(defaultPatterns, false),
      Assertions.cAssertEq('is correct pattern and offset', 'undefined')
    ])),
    Logger.t('pattern without content returns undefined', Chain.asStep(createRng('*** x***', 4, 4), [
      cGetInlinePattern(defaultPatterns, true),
      Assertions.cAssertEq('is correct pattern and offset', 'undefined')
    ])),

    Logger.t('inline * without content before or after', Chain.asStep(createRng('*x*', 3, 3), [
      cGetInlinePattern(defaultPatterns, false),
      Assertions.cAssertEq('is correct pattern and offset',
        { pattern: { start: '*', end: '*', format: 'italic' }, startOffset: 0, endOffset: 2 }
      )
    ])),
    Logger.t('inline * with content before', Chain.asStep(createRng('a *x*', 5, 5), [
      cGetInlinePattern(defaultPatterns, false),
      Assertions.cAssertEq('is correct pattern and offset',
        { pattern: { start: '*', end: '*', format: 'italic' }, startOffset: 2, endOffset: 4 }
      )
    ])),
    Logger.t('inline * with content before and after', Chain.asStep(createRng('a *x* b', 5, 5), [
      cGetInlinePattern(defaultPatterns, false),
      Assertions.cAssertEq('is correct pattern and offset',
        { pattern: { start: '*', end: '*', format: 'italic' }, startOffset: 2, endOffset: 4 }
      )
    ])),
    Logger.t('inline * with content before and after, with space', Chain.asStep(createRng('***x* **', 6, 6), [
      cGetInlinePattern(defaultPatterns, true),
      Assertions.cAssertEq('is correct pattern and offset',
        { pattern: { start: '*', end: '*', format: 'italic' }, startOffset: 2, endOffset: 4 }
      )
    ])),
    Logger.t('inline ** without content before or after', Chain.asStep(createRng('**x**', 5, 5), [
      cGetInlinePattern(defaultPatterns, false),
      Assertions.cAssertEq('is correct pattern and offset',
        { pattern: { start: '**', end: '**', format: 'bold' }, startOffset: 0, endOffset: 3 }
      )
    ])),
    Logger.t('inline ** with content before', Chain.asStep(createRng('a **x**', 7, 7), [
      cGetInlinePattern(defaultPatterns, false),
      Assertions.cAssertEq('is correct pattern and offset',
        { pattern: { start: '**', end: '**', format: 'bold' }, startOffset: 2, endOffset: 5 }
      )
    ])),
    Logger.t('inline ** with content before and after', Chain.asStep(createRng('a **x** b', 7, 7), [
      cGetInlinePattern(defaultPatterns, false),
      Assertions.cAssertEq('is correct pattern and offset',
        { pattern: { start: '**', end: '**', format: 'bold' }, startOffset: 2, endOffset: 5 }
      )
    ])),
    Logger.t('inline *** without content before or after', Chain.asStep(createRng('***x***', 7, 7), [
      cGetInlinePattern(defaultPatterns, false),
      Assertions.cAssertEq('is correct pattern and offset',
        { pattern: { start: '***', end: '***', format: ['bold', 'italic'] }, startOffset: 0, endOffset: 4 }
      )
    ])),
    Logger.t('inline *** with content before', Chain.asStep(createRng('a ***x***', 9, 9), [
      cGetInlinePattern(defaultPatterns, false),
      Assertions.cAssertEq('is correct pattern and offset',
        { pattern: { start: '***', end: '***', format: ['bold', 'italic'] }, startOffset: 2, endOffset: 6 }
      )
    ])),
    Logger.t('inline *** with content before and after', Chain.asStep(createRng('a ***x*** b', 9, 9), [
      cGetInlinePattern(defaultPatterns, false),
      Assertions.cAssertEq('is correct pattern and offset',
        { pattern: { start: '***', end: '***', format: ['bold', 'italic'] }, startOffset: 2, endOffset: 6 }
      )
    ])),
    Logger.t('force only ** pattern and test return on not existing *** pattern', Chain.asStep(createRng('***x***', 7, 7), [
      cGetInlinePattern([{ start: '**', end: '**', format: 'bold' }], false),
      Assertions.cAssertEq('is correct pattern and offset',
        { pattern: { start: '**', end: '**', format: 'bold' }, startOffset: 1, endOffset: 4 }
      )
    ])),
    Logger.t('force only ** pattern and test return on not existing *** pattern', Chain.asStep(createRng('y ***x***', 9, 9), [
      cGetInlinePattern([{ start: '**', end: '**', format: 'bold' }], false),
      Assertions.cAssertEq('is correct pattern and offset',
        { pattern: { start: '**', end: '**', format: 'bold' }, startOffset: 3, endOffset: 6 }
      )
    ])),
    Logger.t('force only ** pattern and test return on not existing *** pattern', Chain.asStep(createRng('y ***x*** **', 9, 9), [
      cGetInlinePattern([{ start: '**', end: '**', format: 'bold' }], false),
      Assertions.cAssertEq('is correct pattern and offset',
        { pattern: { start: '**', end: '**', format: 'bold' }, startOffset: 3, endOffset: 6 }
      )
    ]))
  ], function () {
    success();
  }, failure);
});
