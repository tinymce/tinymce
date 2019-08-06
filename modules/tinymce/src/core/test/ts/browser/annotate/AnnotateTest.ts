import { GeneralSteps, Pipeline, Logger, Assertions, ApproxStructure } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import Editor from 'tinymce/core/api/Editor';
import Theme from 'tinymce/themes/silver/Theme';

import { sAnnotate, sAssertHtmlContent } from '../../module/test/AnnotationAsserts';
import { Element } from '@ephox/sugar';

UnitTest.asynctest('browser.tinymce.core.annotate.AnnotateTest', (success, failure) => {
  Theme();

  TinyLoader.setupLight(function (editor: Editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);

    // TODO: Consider testing collapse sections.
    const sTestWordGrabIfCollapsed = Logger.t(
      'Should word grab with a collapsed selection',
      GeneralSteps.sequence([
        // '<p>This |is| the first paragraph</p><p>This is the second.</p>'
        tinyApis.sSetContent('<p>This is the first paragraph here</p><p>This is the second.</p>'),
        tinyApis.sSetSelection([ 0, 0 ], 'This is the first p'.length, [ 0, 0 ], 'This is the first p'.length),
        sAnnotate(editor, 'test-annotation', 'test-uid', { anything: 'one-paragraph' }),
        sAssertHtmlContent(tinyApis, [
          `<p>This is the first <span data-test-anything="one-paragraph" data-mce-annotation="test-annotation" data-mce-annotation-uid="test-uid" class="mce-annotation">paragraph</span> here</p>`,
          '<p>This is the second.</p'
        ]),

        tinyApis.sAssertSelection([ 0 ], 1, [ 0 ], 2)
      ])
    );

    const sTestCanAnnotateDirectParentOfRoot = Logger.t(
      'Should be able to annotate a direct parent of the body (e.g. an empty paragraph)',
      GeneralSteps.sequence([
        tinyApis.sSetContent('<p>First</p><p><br/></p><p>Third</p>'),
        tinyApis.sSetSelection([ 1 ], 0, [ 1 ], 0),
        sAnnotate(editor, 'test-annotation', 'test-uid', { anything: 'empty-paragraph' }),
        sAssertHtmlContent(tinyApis, [
          '<p>First</p>',
          '<p><span data-test-anything="empty-paragraph" data-mce-annotation="test-annotation" data-mce-annotation-uid="test-uid" class="mce-annotation"><br /></span></p>',
          '<p>Third</p>'
        ]),
      ])
    );

    const sTestCanAnnotateBeforeTwoNonBreakingSpaces = Logger.t(
      'Should annotate when the cursor is collapsed before two nbsps',
      GeneralSteps.sequence([
        tinyApis.sSetContent('<p>Annotation here &nbsp;&nbsp;, please</p>'),
        tinyApis.sSetCursor([ 0, 0 ], 'Annotation here '.length),
        sAnnotate(editor, 'test-annotation', 'test-uid', { anything: 'nbsp-paragraph' }),
        Assertions.sAssertStructure(
          'Checking body element',
          ApproxStructure.build((s, str, arr) => {
            return s.element('body', {
              children: [
                s.element('p', {
                  children: [
                    s.text( str.is('Annotation here ') ),
                    s.element('span', {
                      classes: [ arr.has('mce-annotation') ],
                      html: str.is('&nbsp;')
                    }),
                    s.text( str.is('\u00A0\u00A0, please'))
                  ]
                })
              ]
            });
          }),
          Element.fromDom(editor.getBody())
        )
      ])
    );

    const sTestCanAnnotateWithinTwoNonBreakingSpaces = Logger.t(
      'Should annotate when the cursor is collapsed between two nbsps',
      GeneralSteps.sequence([
        tinyApis.sSetContent('<p>Annotation here &nbsp;&nbsp;, please</p>'),
        tinyApis.sSetCursor([ 0, 0 ], 'Annotation here  '.length),
        sAnnotate(editor, 'test-annotation', 'test-uid', { anything: 'nbsp-paragraph' }),
        Assertions.sAssertStructure(
          'Checking body element',
          ApproxStructure.build((s, str, arr) => {
            return s.element('body', {
              children: [
                s.element('p', {
                  children: [
                    s.text( str.is('Annotation here \u00A0') ),
                    s.element('span', {
                      classes: [ arr.has('mce-annotation') ],
                      html: str.is('&nbsp;')
                    }),
                    s.text( str.is('\u00A0, please'))
                  ]
                })
              ]
            });
          }),
          Element.fromDom(editor.getBody())
        )
      ])
    );

    const sTestCanAnnotateAfterTwoNonBreakingSpaces = Logger.t(
      'Should annotate when the cursor is collapsed after two nbsps',
      GeneralSteps.sequence([
        tinyApis.sSetContent('<p>Annotation here &nbsp;&nbsp;, please</p>'),
        tinyApis.sSetCursor([ 0, 0 ], 'Annotation here   '.length),
        sAnnotate(editor, 'test-annotation', 'test-uid', { anything: 'nbsp-paragraph' }),
        Assertions.sAssertStructure(
          'Checking body element',
          ApproxStructure.build((s, str, arr) => {
            return s.element('body', {
              children: [
                s.element('p', {
                  children: [
                    s.text( str.is('Annotation here \u00A0\u00A0') ),
                    s.element('span', {
                      classes: [ arr.has('mce-annotation') ],
                      html: str.is(',')
                    }),
                    s.text( str.is(' please'))
                  ]
                })
              ]
            });
          }),
          Element.fromDom(editor.getBody())
        )
      ])
    );

    const sTestDoesNotWordGrabIfNotCollapsed = Logger.t(
      'Should not word grab if the selection is not collapsed',
      GeneralSteps.sequence([
        // '<p>This |is| the first paragraph</p><p>This is the second.</p>'
        tinyApis.sSetContent('<p>This is the first paragraph</p><p>This is the second.</p>'),
        tinyApis.sSetSelection([ 0, 0 ], 'This is the first p'.length, [ 0, 0 ], 'This is the first par'.length),
        sAnnotate(editor, 'test-annotation', 'test-uid', { anything: 'one-paragraph' }),
        sAssertHtmlContent(tinyApis, [
          `<p>This is the first p<span data-test-anything="one-paragraph" data-mce-annotation="test-annotation" data-mce-annotation-uid="test-uid" class="mce-annotation">ar</span>agraph</p>`,
          '<p>This is the second.</p'
        ]),

        tinyApis.sAssertSelection([ 0 ], 1, [ 0 ], 2)
      ])
    );

    const sTestInOneParagraph = Logger.t(
      'Testing in one pararaph',
      GeneralSteps.sequence([
        // '<p>This |is| the first paragraph</p><p>This is the second.</p>'
        tinyApis.sSetContent('<p>This is the first paragraph</p><p>This is the second.</p>'),
        tinyApis.sSetSelection([ 0, 0 ], 'This '.length, [ 0, 0 ], 'This is'.length),
        sAnnotate(editor, 'test-annotation', 'test-uid', { anything: 'one-paragraph' }),
        sAssertHtmlContent(tinyApis, [
          `<p>This <span data-test-anything="one-paragraph" data-mce-annotation="test-annotation" data-mce-annotation-uid="test-uid" class="mce-annotation">is</span> the first paragraph</p>`,
          '<p>This is the second.</p'
        ]),

        tinyApis.sAssertSelection([ 0 ], 1, [ 0 ], 2)
      ])
    );

    const sTestInTwoParagraphs = Logger.t(
      'Testing over two paragraphs',
      GeneralSteps.sequence([
        // '<p>This |is the first paragraph</p><p>This is| the second.</p>'
        tinyApis.sSetContent('<p>This is the first paragraph</p><p>This is the second.</p>'),
        tinyApis.sSetSelection([ 0, 0 ], 'This '.length, [ 1, 0 ], 'This is'.length),
        sAnnotate(editor, 'test-annotation', 'test-uid', { anything: 'two-paragraphs' }),
        sAssertHtmlContent(tinyApis, [
          `<p>This <span data-mce-annotation="test-annotation" data-test-anything="two-paragraphs" data-mce-annotation-uid="test-uid" class="mce-annotation">is the first paragraph</span></p>`,
          `<p><span data-mce-annotation="test-annotation" data-test-anything="two-paragraphs" data-mce-annotation-uid="test-uid" class="mce-annotation">This is</span> the second.</p>`
        ]),
        tinyApis.sAssertSelection([ 0 ], 1, [ 1 ], 1)
      ])
    );

    const sTestInThreeParagraphs = Logger.t(
      'Testing over three paragraphs',
      GeneralSteps.sequence([
        // '<p>This |is the first paragraph</p><p>This is the second.</p><p>This is| the third.</p>'
        tinyApis.sSetContent('<p>This is the first paragraph</p><p>This is the second.</p><p>This is the third.</p>'),
        tinyApis.sSetSelection([ 0, 0 ], 'This '.length, [ 2, 0 ], 'This is'.length),
        sAnnotate(editor, 'test-annotation', 'test-uid', { anything: 'three-paragraphs' }),
        sAssertHtmlContent(tinyApis, [
          `<p>This <span data-mce-annotation="test-annotation" data-test-anything="three-paragraphs" data-mce-annotation-uid="test-uid" class="mce-annotation">is the first paragraph</span></p>`,
          `<p><span data-mce-annotation="test-annotation" data-test-anything="three-paragraphs" data-mce-annotation-uid="test-uid" class="mce-annotation">This is the second.</span></p>`,
          `<p><span data-mce-annotation="test-annotation" data-test-anything="three-paragraphs" data-mce-annotation-uid="test-uid" class="mce-annotation">This is</span> the third.</p>`
        ]),
        tinyApis.sAssertSelection([ 0 ], 1, [ 2 ], 1)
      ])
    );

    Pipeline.async({}, [
      tinyApis.sFocus,
      sTestWordGrabIfCollapsed,
      sTestDoesNotWordGrabIfNotCollapsed,
      sTestCanAnnotateDirectParentOfRoot,
      sTestCanAnnotateBeforeTwoNonBreakingSpaces,
      sTestCanAnnotateWithinTwoNonBreakingSpaces,
      sTestCanAnnotateAfterTwoNonBreakingSpaces,
      sTestInOneParagraph,
      sTestInTwoParagraphs,
      sTestInThreeParagraphs
    ], onSuccess, onFailure);
  }, {
    base_url: '/project/tinymce/js/tinymce',
    setup: (ed: Editor) => {
      ed.on('init', () => {
        ed.annotator.register('test-annotation', {
          decorate: (uid, data) => {
            return {
              attributes: {
                'data-test-anything': data.anything
              },
              classes: [ ]
            };
          }
        });
      });
    }
  }, success, failure);
});
