import { ApproxStructure, Assertions, Logger, Pipeline, Step, StepSequence } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import { Element } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';
import Theme from 'tinymce/themes/silver/Theme';

import { sAnnotate, sAssertHtmlContent } from '../../module/test/AnnotationAsserts';

UnitTest.asynctest('browser.tinymce.core.annotate.AnnotateTest', (success, failure) => {
  Theme();

  TinyLoader.setupLight(function (editor: Editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);

    // TODO: Consider testing collapse sections.
    const sTestWordGrabIfCollapsed = <T> (): Step<T, T> => Logger.t(
      'Should word grab with a collapsed selection',
      StepSequence.sequenceSame([
        // '<p>This |is| the first paragraph</p><p>This is the second.</p>'
        tinyApis.sSetContent('<p>This is the first paragraph here</p><p>This is the second.</p>'),
        tinyApis.sSetSelection([ 0, 0 ], 'This is the first p'.length, [ 0, 0 ], 'This is the first p'.length),
        sAnnotate(editor, 'test-annotation', 'test-uid', { anything: 'one-paragraph' }),
        sAssertHtmlContent(tinyApis, [
          '<p>This is the first <span data-test-anything="one-paragraph" data-mce-annotation="test-annotation" data-mce-annotation-uid="test-uid" class="mce-annotation">paragraph</span> here</p>',
          '<p>This is the second.</p>'
        ]),

        tinyApis.sAssertSelection([ 0 ], 1, [ 0 ], 2)
      ])
    );

    const sTestCanAnnotateDirectParentOfRoot = <T> (): Step<T, T> => Logger.t(
      'Should be able to annotate a direct parent of the body (e.g. an empty paragraph)',
      StepSequence.sequenceSame([
        tinyApis.sSetContent('<p>First</p><p><br/></p><p>Third</p>'),
        tinyApis.sSetSelection([ 1 ], 0, [ 1 ], 0),
        sAnnotate(editor, 'test-annotation', 'test-uid', { anything: 'empty-paragraph' }),
        sAssertHtmlContent(tinyApis, [
          '<p>First</p>',
          '<p><span data-test-anything="empty-paragraph" data-mce-annotation="test-annotation" data-mce-annotation-uid="test-uid" class="mce-annotation"><br /></span></p>',
          '<p>Third</p>'
        ])
      ])
    );

    const sTestCanAnnotateBeforeTwoNonBreakingSpaces = <T> (): Step<T, T> => Logger.t(
      'Should annotate when the cursor is collapsed before two nbsps',
      StepSequence.sequenceSame([
        tinyApis.sSetContent('<p>Annotation here &nbsp;&nbsp;, please</p>'),
        tinyApis.sSetCursor([ 0, 0 ], 'Annotation here '.length),
        sAnnotate(editor, 'test-annotation', 'test-uid', { anything: 'nbsp-paragraph' }),
        Assertions.sAssertStructure(
          'Checking body element',
          ApproxStructure.build((s, str, arr) => s.element('body', {
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
          })),
          Element.fromDom(editor.getBody())
        )
      ])
    );

    const sTestCanAnnotateWithinTwoNonBreakingSpaces = <T> (): Step<T, T> => Logger.t(
      'Should annotate when the cursor is collapsed between two nbsps',
      StepSequence.sequenceSame([
        tinyApis.sSetContent('<p>Annotation here &nbsp;&nbsp;, please</p>'),
        tinyApis.sSetCursor([ 0, 0 ], 'Annotation here  '.length),
        sAnnotate(editor, 'test-annotation', 'test-uid', { anything: 'nbsp-paragraph' }),
        Assertions.sAssertStructure(
          'Checking body element',
          ApproxStructure.build((s, str, arr) => s.element('body', {
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
          })),
          Element.fromDom(editor.getBody())
        )
      ])
    );

    const sTestCanAnnotateAfterTwoNonBreakingSpaces = <T> (): Step<T, T> => Logger.t(
      'Should annotate when the cursor is collapsed after two nbsps',
      StepSequence.sequenceSame([
        tinyApis.sSetContent('<p>Annotation here &nbsp;&nbsp;, please</p>'),
        tinyApis.sSetCursor([ 0, 0 ], 'Annotation here   '.length),
        sAnnotate(editor, 'test-annotation', 'test-uid', { anything: 'nbsp-paragraph' }),
        Assertions.sAssertStructure(
          'Checking body element',
          ApproxStructure.build((s, str, arr) => s.element('body', {
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
          })),
          Element.fromDom(editor.getBody())
        )
      ])
    );

    const sTestDoesNotWordGrabIfNotCollapsed = <T> (): Step<T, T> => Logger.t(
      'Should not word grab if the selection is not collapsed',
      StepSequence.sequenceSame([
        // '<p>This |is| the first paragraph</p><p>This is the second.</p>'
        tinyApis.sSetContent('<p>This is the first paragraph</p><p>This is the second.</p>'),
        tinyApis.sSetSelection([ 0, 0 ], 'This is the first p'.length, [ 0, 0 ], 'This is the first par'.length),
        sAnnotate(editor, 'test-annotation', 'test-uid', { anything: 'one-paragraph' }),
        sAssertHtmlContent(tinyApis, [
          '<p>This is the first p<span data-test-anything="one-paragraph" data-mce-annotation="test-annotation" data-mce-annotation-uid="test-uid" class="mce-annotation">ar</span>agraph</p>',
          '<p>This is the second.</p>'
        ]),

        tinyApis.sAssertSelection([ 0 ], 1, [ 0 ], 2)
      ])
    );

    const sTestInOneParagraph = <T> (): Step<T, T> => Logger.t(
      'Testing in one paragraph',
      StepSequence.sequenceSame([
        // '<p>This |is| the first paragraph</p><p>This is the second.</p>'
        tinyApis.sSetContent('<p>This is the first paragraph</p><p>This is the second.</p>'),
        tinyApis.sSetSelection([ 0, 0 ], 'This '.length, [ 0, 0 ], 'This is'.length),
        sAnnotate(editor, 'test-annotation', 'test-uid', { anything: 'one-paragraph' }),
        sAssertHtmlContent(tinyApis, [
          '<p>This <span data-test-anything="one-paragraph" data-mce-annotation="test-annotation" data-mce-annotation-uid="test-uid" class="mce-annotation">is</span> the first paragraph</p>',
          '<p>This is the second.</p>'
        ]),

        tinyApis.sAssertSelection([ 0 ], 1, [ 0 ], 2)
      ])
    );

    const sTestInTwoParagraphs = <T> (): Step<T, T> => Logger.t(
      'Testing over two paragraphs',
      StepSequence.sequenceSame([
        // '<p>This |is the first paragraph</p><p>This is| the second.</p>'
        tinyApis.sSetContent('<p>This is the first paragraph</p><p>This is the second.</p>'),
        tinyApis.sSetSelection([ 0, 0 ], 'This '.length, [ 1, 0 ], 'This is'.length),
        sAnnotate(editor, 'test-annotation', 'test-uid', { anything: 'two-paragraphs' }),
        sAssertHtmlContent(tinyApis, [
          '<p>This <span data-mce-annotation="test-annotation" data-test-anything="two-paragraphs" data-mce-annotation-uid="test-uid" class="mce-annotation">is the first paragraph</span></p>',
          '<p><span data-mce-annotation="test-annotation" data-test-anything="two-paragraphs" data-mce-annotation-uid="test-uid" class="mce-annotation">This is</span> the second.</p>'
        ]),
        tinyApis.sAssertSelection([ 0 ], 1, [ 1 ], 1)
      ])
    );

    const sTestInThreeParagraphs = <T> (): Step<T, T> => Logger.t(
      'Testing over three paragraphs',
      StepSequence.sequenceSame([
        // '<p>This |is the first paragraph</p><p>This is the second.</p><p>This is| the third.</p>'
        tinyApis.sSetContent('<p>This is the first paragraph</p><p>This is the second.</p><p>This is the third.</p>'),
        tinyApis.sSetSelection([ 0, 0 ], 'This '.length, [ 2, 0 ], 'This is'.length),
        sAnnotate(editor, 'test-annotation', 'test-uid', { anything: 'three-paragraphs' }),
        sAssertHtmlContent(tinyApis, [
          '<p>This <span data-mce-annotation="test-annotation" data-test-anything="three-paragraphs" data-mce-annotation-uid="test-uid" class="mce-annotation">is the first paragraph</span></p>',
          '<p><span data-mce-annotation="test-annotation" data-test-anything="three-paragraphs" data-mce-annotation-uid="test-uid" class="mce-annotation">This is the second.</span></p>',
          '<p><span data-mce-annotation="test-annotation" data-test-anything="three-paragraphs" data-mce-annotation-uid="test-uid" class="mce-annotation">This is</span> the third.</p>'
        ]),
        tinyApis.sAssertSelection([ 0 ], 1, [ 2 ], 1)
      ])
    );

    const sTestInTable = <T> (): Step<T, T> => Logger.t(
      'Testing in table',
      StepSequence.sequenceSame([
        // '<table><tbody><tr><td>|cell 1|</td><td>cell 2</td></tr><tr><td>|cell 3|</td><td>cell 4</td></tr></tbody></table><p>This is the second.</p>'
        tinyApis.sSetContent('<table><tbody><tr><td data-mce-selected="1">cell 1</td><td>cell 2</td></tr><tr><td data-mce-selected="1">cell 3</td><td>cell 4</td></tr></tbody></table><p>This is the second.</p>'),
        tinyApis.sSetSelection([ 0, 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0, 0 ], 1),
        sAnnotate(editor, 'test-annotation', 'test-uid', { anything: 'table' }),
        sAssertHtmlContent(tinyApis, [
          [
            '<table><tbody>',
            '<tr><td><span data-test-anything="table" data-mce-annotation="test-annotation" data-mce-annotation-uid="test-uid" class="mce-annotation">cell 1</span></td><td>cell 2</td></tr>',
            '<tr><td><span data-test-anything="table" data-mce-annotation="test-annotation" data-mce-annotation-uid="test-uid" class="mce-annotation">cell 3</span></td><td>cell 4</td></tr>',
            '</tbody></table>'
          ].join(''),
          '<p>This is the second.</p>'
        ], true),

        tinyApis.sAssertSelection([ 0, 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0, 0, 0 ], 1)
      ])
    );

    Pipeline.runStep({}, StepSequence.sequenceSame([
      tinyApis.sFocus(),
      sTestWordGrabIfCollapsed(),
      sTestDoesNotWordGrabIfNotCollapsed(),
      sTestCanAnnotateDirectParentOfRoot(),
      sTestCanAnnotateBeforeTwoNonBreakingSpaces(),
      sTestCanAnnotateWithinTwoNonBreakingSpaces(),
      sTestCanAnnotateAfterTwoNonBreakingSpaces(),
      sTestInOneParagraph(),
      sTestInTwoParagraphs(),
      sTestInThreeParagraphs(),
      sTestInTable()
    ]), onSuccess, onFailure);
  }, {
    base_url: '/project/tinymce/js/tinymce',
    setup: (ed: Editor) => {
      ed.on('init', () => {
        ed.annotator.register('test-annotation', {
          decorate: (uid, data) => ({
            attributes: {
              'data-test-anything': data.anything
            },
            classes: [ ]
          })
        });
      });
    }
  }, success, failure);
});
