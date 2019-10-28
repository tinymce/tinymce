import { ApproxStructure, Assertions, GeneralSteps, Keys, Logger, Pipeline, Step, StructAssert } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { TinyActions, TinyApis, TinyLoader } from '@ephox/mcagar';
import { Element } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';
import Env from 'tinymce/core/api/Env';
import Zwsp from 'tinymce/core/text/Zwsp';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.core.keyboard.ArrowKeysAnchorTest', function (success, failure) {
  const BEFORE = true, AFTER = false;
  const START = true, END = false;

  Theme();

  const addGeckoBr = function (s, str, children) {
    if (Env.gecko) {
      return [].concat(children).concat(s.element('br', { attrs: { 'data-mce-bogus': str.is('1') } }));
    } else {
      return children;
    }
  };

  const anchorSurroundedWithText = function (expectedText: string) {
    return ApproxStructure.build(function (s, str/*, arr*/) {
      return s.element('p', {
        children: [
          s.text(str.is('a')),
          s.element('a', {
            attrs: {
              'data-mce-selected': str.is('inline-boundary'),
              'data-mce-href': str.is('#'),
              'href': str.is('#')
            },
            children: [
              s.text(str.is(expectedText))
            ]
          }),
          s.text(str.is('c'))
        ]
      });
    });
  };

  const anchorSurroundedWithZwspInside = function (start: boolean) {
    return anchorSurroundedWithText(start ? Zwsp.ZWSP + 'b' : 'b' + Zwsp.ZWSP);
  };

  const anchorSurroundedWithZwspOutside = function (before: boolean) {
    return ApproxStructure.build(function (s, str/*, arr*/) {
      return s.element('p', {
        children: [
          s.text(str.is('a' + (before ? Zwsp.ZWSP : ''))),
          s.element('a', {
            attrs: {
              'data-mce-selected': str.none('inline-boundary'),
              'data-mce-href': str.is('#'),
              'href': str.is('#')
            },
            children: [
              s.text(str.is('b'))
            ]
          }),
          s.text(str.is((before === false ? Zwsp.ZWSP : '') + 'c'))
        ]
      });
    });
  };

  const anchorsZwspOutside = function (texts: string[], before: boolean, index: number) {
    return ApproxStructure.build(function (s, str/*, arr*/) {
      const children = Arr.map(texts, function (text, i) {
        return Arr.flatten([
          index === i && before ? [ s.text(str.is(Zwsp.ZWSP)) ] : [ ],
          [
            s.element(
              'a',
              {
                attrs: {
                  'data-mce-selected': str.none('inline-boundary'),
                  'data-mce-href': str.is('#'),
                  'href': str.is('#')
                },
                children: [
                  s.text(str.is(text))
                ]
              }
            )
          ],
          index === i && before === false ? [ s.text(str.is(Zwsp.ZWSP)) ] : [ ]
        ]);
      });

      return s.element('p', {
        children: addGeckoBr(s, str, Arr.flatten(children))
      });
    });
  };

  const anchorsZwspInside = function (texts: string[], start: boolean, index: number) {
    return ApproxStructure.build(function (s, str/*, arr*/) {
      const children = Arr.map(texts, function (text, i) {
        const zwspText = start ? Zwsp.ZWSP + text : text + Zwsp.ZWSP;

        return s.element(
          'a',
          {
            attrs: {
              'data-mce-selected': i === index ? str.is('inline-boundary') : str.none('1'),
              'data-mce-href': str.is('#'),
              'href': str.is('#')
            },
            children: [
              s.text(str.is(i === index ? zwspText : text))
            ]
          }
        );
      });

      return s.element('p', {
        children: addGeckoBr(s, str, children)
      });
    });
  };

  const sAssertContentStructure = function (editor: Editor, expected: StructAssert) {
    return Step.sync(function () {
      const actual = Element.fromHtml(editor.getBody().innerHTML);
      return Assertions.assertStructure('Should be the same structure', expected, actual);
    });
  };

  const sAssertCursor = function (tinyApis: TinyApis, elementPath: number[], offset: number) {
    return tinyApis.sAssertSelection(elementPath, offset, elementPath, offset);
  };

  const sTestArrowsSingleAnchor = function (tinyApis: TinyApis, tinyActions: TinyActions, editor: Editor) {
    return Logger.t('sTestArrowsSingleAnchor', GeneralSteps.sequence([
      tinyApis.sSetContent('<p><a href="#">b</a></p>'),

      tinyApis.sSetCursor([0, 0, 0], 0),
      tinyApis.sNodeChanged(),
      sAssertCursor(tinyApis, [0, 0, 0], 1),
      sAssertContentStructure(editor, anchorsZwspInside(['b'], START, 0)),

      tinyActions.sContentKeystroke(Keys.left(), { }),
      sAssertCursor(tinyApis, [0, 0], 0),
      sAssertContentStructure(editor, anchorsZwspOutside(['b'], BEFORE, 0)),

      tinyActions.sContentKeystroke(Keys.left(), { }),
      sAssertCursor(tinyApis, [0, 0], 0),
      sAssertContentStructure(editor, anchorsZwspOutside(['b'], BEFORE, 0)),

      tinyActions.sContentKeystroke(Keys.right(), { }),
      sAssertCursor(tinyApis, [0, 0, 0], 1),
      sAssertContentStructure(editor, anchorsZwspInside(['b'], START, 0)),

      tinyActions.sContentKeystroke(Keys.right(), { }),
      sAssertCursor(tinyApis, [0, 0, 0], 1),
      sAssertContentStructure(editor, anchorsZwspInside(['b'], END, 0)),

      tinyActions.sContentKeystroke(Keys.right(), { }),
      sAssertCursor(tinyApis, [0, 1], 1),
      sAssertContentStructure(editor, anchorsZwspOutside(['b'], AFTER, 0)),

      tinyActions.sContentKeystroke(Keys.right(), { }),
      sAssertCursor(tinyApis, [0, 1], 1),
      sAssertContentStructure(editor, anchorsZwspOutside(['b'], AFTER, 0))
    ]));
  };

  const sTestArrowsAnchorSurroundedByText = function (tinyApis: TinyApis, tinyActions: TinyActions, editor: Editor) {
    return Logger.t('sTestArrowsAnchorSurroundedByText', GeneralSteps.sequence([
      tinyApis.sSetContent('<p>a<a href="#">b</a>c</p>'),

      tinyApis.sSetCursor([0, 1, 0], 0),
      tinyApis.sNodeChanged(),
      sAssertCursor(tinyApis, [0, 1, 0], 1),
      sAssertContentStructure(editor, anchorSurroundedWithZwspInside(START)),

      tinyActions.sContentKeystroke(Keys.left(), { }),
      sAssertCursor(tinyApis, [0, 0], 1),
      sAssertContentStructure(editor, anchorSurroundedWithZwspOutside(BEFORE)),

      tinyActions.sContentKeystroke(Keys.right(), { }),
      sAssertCursor(tinyApis, [0, 1, 0], 1),
      sAssertContentStructure(editor, anchorSurroundedWithZwspInside(START)),

      tinyActions.sContentKeystroke(Keys.right(), { }),
      sAssertCursor(tinyApis, [0, 1, 0], 1),
      sAssertContentStructure(editor, anchorSurroundedWithZwspInside(END)),

      tinyActions.sContentKeystroke(Keys.right(), { }),
      sAssertCursor(tinyApis, [0, 2], 1),
      sAssertContentStructure(editor, anchorSurroundedWithZwspOutside(AFTER))
    ]));
  };

  const sTestArrowsMultipleAnchors = function (tinyApis: TinyApis, tinyActions: TinyActions, editor: Editor) {
    return Logger.t('sTestArrowsMultipleAnchors', GeneralSteps.sequence([
      tinyApis.sSetContent('<p><a href="#">a</a><a href="#">b</a></p>'),

      tinyApis.sSetCursor([0, 0, 0], 0),
      tinyApis.sNodeChanged(),
      sAssertCursor(tinyApis, [0, 0, 0], 1),
      sAssertContentStructure(editor, anchorsZwspInside(['a', 'b'], START, 0)),

      tinyActions.sContentKeystroke(Keys.left(), { }),
      sAssertCursor(tinyApis, [0, 0], 0),
      sAssertContentStructure(editor, anchorsZwspOutside(['a', 'b'], BEFORE, 0)),

      tinyActions.sContentKeystroke(Keys.left(), { }),
      sAssertCursor(tinyApis, [0, 0], 0),
      sAssertContentStructure(editor, anchorsZwspOutside(['a', 'b'], BEFORE, 0)),

      tinyActions.sContentKeystroke(Keys.right(), { }),
      sAssertCursor(tinyApis, [0, 0, 0], 1),
      sAssertContentStructure(editor, anchorsZwspInside(['a', 'b'], START, 0)),

      tinyActions.sContentKeystroke(Keys.right(), { }),
      sAssertCursor(tinyApis, [0, 0, 0], 1),
      sAssertContentStructure(editor, anchorsZwspInside(['a', 'b'], END, 0)),

      tinyActions.sContentKeystroke(Keys.right(), { }),
      sAssertCursor(tinyApis, [0, 1], 1),
      sAssertContentStructure(editor, anchorsZwspOutside(['a', 'b'], BEFORE, 1)),

      tinyActions.sContentKeystroke(Keys.right(), { }),
      sAssertCursor(tinyApis, [0, 1, 0], 1),
      sAssertContentStructure(editor, anchorsZwspInside(['a', 'b'], START, 1)),

      tinyActions.sContentKeystroke(Keys.right(), { }),
      sAssertCursor(tinyApis, [0, 1, 0], 1),
      sAssertContentStructure(editor, anchorsZwspInside(['a', 'b'], END, 1)),

      tinyActions.sContentKeystroke(Keys.right(), { }),
      sAssertCursor(tinyApis, [0, 2], 1),
      sAssertContentStructure(editor, anchorsZwspOutside(['a', 'b'], AFTER, 1)),

      tinyActions.sContentKeystroke(Keys.right(), { }),
      sAssertCursor(tinyApis, [0, 2], 1),
      sAssertContentStructure(editor, anchorsZwspOutside(['a', 'b'], AFTER, 1))
    ]));
  };

  TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);
    const tinyActions = TinyActions(editor);

    Pipeline.async({}, [
      tinyApis.sFocus(),
      sTestArrowsSingleAnchor(tinyApis, tinyActions, editor),
      sTestArrowsAnchorSurroundedByText(tinyApis, tinyActions, editor),
      sTestArrowsMultipleAnchors(tinyApis, tinyActions, editor)
    ], onSuccess, onFailure);
  }, {
    add_unload_trigger: false,
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
