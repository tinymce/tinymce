import { GeneralSteps, Pipeline, Waiter, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import { Editor } from 'tinymce/core/api/Editor';
import ModernTheme from 'tinymce/themes/modern/Theme';

import { sAnnotate, sAssertHtmlContent } from '../../module/test/AnnotationAsserts';

UnitTest.asynctest('browser.tinymce.plugins.remark.AnnotationUpdateTest', (success, failure) => {
  ModernTheme();

  TinyLoader.setup(function (editor: Editor, onSuccess, onFailure) {
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
    const inside2 = { path: [ 1, 1, 0 ], offset: 'hi'.length };
    const outside2 = { path: [ 1, 2 ], offset: ' the '.length };
    const inside3 = { path: [ 2, 1, 0 ], offset: 'i'.length };
    const outside3 = { path: [ 2, 0 ], offset: 'This'.length };

    // Outside: p(0) > text(0) > "Th".length
    // Inside: p(0) > span(1) > text(0) > 'i'.length
    // Inside: p(1) > span(1) > text(0), 'hi'.length
    // Outside: p(1) > text(2) > ' the '.length
    const sSetToActive = GeneralSteps.sequence([
      tinyApis.sSetSelection(outside1.path, outside1.offset, outside1.path, outside1.offset),
      Waiter.sTryUntil(
        'Nothing active (outside1)',
        tinyApis.sAssertContentPresence({
          '.mce-annotation': 3,
          '.mce-active-annotation': 0
        }),
        100,
        1000
      ),

      tinyApis.sSetSelection(inside1.path, inside1.offset, inside1.path, inside1.offset),
      Waiter.sTryUntil(
        'alpha active (inside1)',
        tinyApis.sAssertContentPresence({
          '.mce-annotation': 3,
          '.mce-active-annotation': 1,
          '.mce-active-annotation[data-mce-annotation-uid="id-one"]': 1
        }),
        100,
        1000
      ),

      tinyApis.sSetSelection(inside2.path, inside2.offset, inside2.path, inside2.offset),
      Waiter.sTryUntil(
        'alpha active (inside2)',
        tinyApis.sAssertContentPresence({
          '.mce-annotation': 3,
          '.mce-active-annotation': 1,
          '.mce-active-annotation[data-mce-annotation-uid="id-two"]': 1
        }),
        100,
        1000
      ),

      tinyApis.sSetSelection(outside2.path, outside2.offset, outside2.path, outside2.offset),
      Waiter.sTryUntil(
        'nothing active (outside2)',
        tinyApis.sAssertContentPresence({
          '.mce-annotation': 3,
          '.mce-active-annotation': 0
        }),
        100,
        1000
      ),

      tinyApis.sSetSelection(inside3.path, inside3.offset, inside3.path, inside3.offset),
      Waiter.sTryUntil(
        'beta active (inside3)',
        tinyApis.sAssertContentPresence({
          '.mce-annotation': 3,
          '.mce-active-annotation': 1,
          '.mce-active-annotation[data-mce-annotation-uid="id-three"]': 1
        }),
        100,
        1000
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
          '.mce-annotation': 3,
          '.mce-active-annotation': 1,
          '.mce-active-annotation[data-mce-annotation-uid="id-three"]': 1
        }),
        100,
        1000
      ),

      Step.sync(() => {
        editor.annotator.remove('beta');
      }),
      Waiter.sTryUntil(
        'removed beta',
        tinyApis.sAssertContentPresence({
          '.mce-annotation': 2,
          '.mce-active-annotation': 0
        }),
        100,
        1000
      ),

      Step.sync(() => {
        editor.annotator.setToActive('id-two', 'alpha');
      }),
      Waiter.sTryUntil(
        'setting active to id-two',
        tinyApis.sAssertContentPresence({
          '.mce-annotation': 2,
          '.mce-active-annotation': 1,
          '.mce-active-annotation[data-mce-annotation-uid="id-two"]': 1
        }),
        100,
        1000
      ),

      tinyApis.sSetSelection(outside3.path, outside3.offset, outside3.path, outside3.offset),
      Waiter.sTryUntil(
        'outside 3 after setToActive',
        tinyApis.sAssertContentPresence({
          '.mce-annotation': 2,
          '.mce-active-annotation': 0
        }),
        100,
        1000
      )
    ]);

    Pipeline.async({}, [
      tinyApis.sFocus,
      sSetupData,
      sSetToActive
    ], onSuccess, onFailure);
  }, {
    skin_url: '/project/js/tinymce/skins/lightgray',
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