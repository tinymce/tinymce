import { GeneralSteps, Pipeline, Step, Waiter, Logger } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import Editor from 'tinymce/core/api/Editor';
import Theme from 'tinymce/themes/silver/Theme';

import { sAnnotate, sAssertHtmlContent, sAssertGetAll } from '../../module/test/AnnotationAsserts';

UnitTest.asynctest('browser.tinymce.core.annotate.AnnotationRemovedTest', (success, failure) => {
  Theme();

  TinyLoader.setupLight(function (editor: Editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);

    const sSetupData = GeneralSteps.sequence([
      // '<p>This |is the first paragraph</p><p>This is the second.</p><p>This is| the third.</p>'
      tinyApis.sSetContent('<p>This was the first paragraph</p><p>This is the second.</p><p>This is the third.</p>'),
      tinyApis.sSetSelection([ 0, 0 ], 'This '.length, [ 0, 0 ], 'This was'.length),
      sAnnotate(editor, 'alpha', 'id-one', { anything: 'comment-1' }),

      tinyApis.sSetSelection([ 1, 0 ], 'T'.length, [ 1, 0 ], 'This is'.length),
      sAnnotate(editor, 'alpha', 'id-two', { anything: 'comment-two' }),

      tinyApis.sSetSelection([ 2, 0 ], 'This is the th'.length, [ 2, 0 ], 'This is the thir'.length),
      sAnnotate(editor, 'beta', 'id-three', { something: 'comment-three' }),

      sAssertHtmlContent(tinyApis, [
        `<p>This <span data-mce-annotation="alpha" data-test-anything="comment-1" data-mce-annotation-uid="id-one" class="mce-annotation">was</span> the first paragraph</p>`,

        `<p>T<span data-mce-annotation="alpha" data-test-anything="comment-two" data-mce-annotation-uid="id-two" class="mce-annotation">his is</span> the second.</p>`,

        `<p>This is the th<span data-mce-annotation="beta" data-test-something="comment-three" data-mce-annotation-uid="id-three" class="mce-annotation">ir</span>d.</p>`
      ])
    ]);

    const outside1 = { path: [ 0, 0 ], offset: 'Th'.length };
    const inside1 = { path: [ 0, 1, 0 ], offset: 'i'.length };
    const inside3 = { path: [ 2, 1, 0 ], offset: 'i'.length };

    // Outside: p(0) > text(0) > "Th".length
    // Inside: p(0) > span(1) > text(0) > 'i'.length
    // Inside: p(1) > span(1) > text(0), 'hi'.length
    // Outside: p(1) > text(2) > ' the '.length
    const sTestGetAndRemove = GeneralSteps.sequence([
      tinyApis.sSetSelection(outside1.path, outside1.offset, outside1.path, outside1.offset),
      Waiter.sTryUntil(
        'Nothing active (outside1)',
        tinyApis.sAssertContentPresence({
          '.mce-annotation': 3
        })
      ),

      Logger.t(
        'There should be two alpha annotations',
        sAssertGetAll(editor, {
          'id-one': 1,
          'id-two': 1
        }, 'alpha')
      ),

      Logger.t(
        'There should be one beta annotation',
        sAssertGetAll(editor, {
          'id-three': 1
        }, 'beta')
      ),

      Step.sync(() => {
        editor.annotator.remove('alpha');
      }),

      // Need to wait because nothing should have changed. If we don't wait, we'll get
      // a false positive when the throttling makes the change delayed.
      Step.wait(1000),

      Waiter.sTryUntil(
        'removed alpha, but was not inside alpha',
        tinyApis.sAssertContentPresence({
          '.mce-annotation': 3
        })
      ),
      Logger.t(
        'There should be still be two alpha annotations (because remove only works if you are inside)',
        sAssertGetAll(editor, {
          'id-one': 1,
          'id-two': 1
        }, 'alpha')
      ),
      Logger.t(
        'There should still be one beta annotation',
        sAssertGetAll(editor, {
          'id-three': 1
        }, 'beta')
      ),

      tinyApis.sSetSelection(inside3.path, inside3.offset, inside3.path, inside3.offset),
      Step.sync(() => {
        editor.annotator.remove('beta');
      }),
      Waiter.sTryUntil(
        'removed beta',
        tinyApis.sAssertContentPresence({
          '.mce-annotation': 2
        })
      ),

      Logger.t(
        'There should be still be two alpha annotations (because cursor was inside beta)',
        sAssertGetAll(editor, {
          'id-one': 1,
          'id-two': 1
        }, 'alpha')
      ),
      Logger.t(
        'There should be no beta annotations',
        sAssertGetAll(editor, { }, 'beta')
      ),

      tinyApis.sSetSelection(inside1.path, inside1.offset, inside1.path, inside1.offset),
      Step.sync(() => {
        editor.annotator.remove('alpha');
      }),

      Waiter.sTryUntil(
        'removed alpha, and was inside alpha',
        tinyApis.sAssertContentPresence({
          '.mce-annotation': 1
        })
      ),

      Logger.t(
        'There should now be just one alpha annotation (second one was removed)',
        sAssertGetAll(editor, {
          'id-two': 1
        }, 'alpha')
      ),
      Logger.t(
        'There should be no beta annotations',
        sAssertGetAll(editor, { }, 'beta')
      ),
    ]);

    Pipeline.async({}, [
      tinyApis.sFocus(),
      sSetupData,
      sTestGetAndRemove
    ], onSuccess, onFailure);
  }, {
    base_url: '/project/tinymce/js/tinymce',
    setup: (ed: Editor) => {
      ed.on('init', () => {
        ed.annotator.register('alpha', {
          decorate: (uid, data) => {
            return {
              attributes: {
                'data-test-anything': data.anything
              },
              classes: [ ]
            };
          }
        });

        ed.annotator.register('beta', {
          decorate: (uid, data) => {
            return {
              attributes: {
                'data-test-something': data.something
              },
              classes: [ ]
            };
          }
        });
      });
    }
  }, success, failure);
});
