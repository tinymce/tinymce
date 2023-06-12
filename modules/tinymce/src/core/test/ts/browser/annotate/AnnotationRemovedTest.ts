import { Waiter } from '@ephox/agar';
import { beforeEach, describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks, TinySelections, TinyState } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

import { annotate, assertGetAll, assertHtmlContent } from '../../module/test/AnnotationAsserts';

describe('browser.tinymce.core.annotate.AnnotationRemovedTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    setup: (ed: Editor) => {
      ed.on('init', () => {
        ed.annotator.register('alpha', {
          decorate: (uid, data) => ({
            attributes: {
              'data-test-anything': data.anything
            },
            classes: [ ]
          })
        });

        ed.annotator.register('beta', {
          decorate: (uid, data) => ({
            attributes: {
              'data-test-something': data.something
            },
            classes: [ ]
          })
        });
      });
    }
  }, [], true);

  beforeEach(() => {
    const editor = hook.editor();

    // '<p>This |is the first paragraph</p><p>This is the second.</p><p>This is| the third.</p>'
    editor.setContent('<p>This was the first paragraph</p><p>This is the second.</p><p>This is the third.</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 'This '.length, [ 0, 0 ], 'This was'.length);
    annotate(editor, 'alpha', 'id-one', { anything: 'comment-1' });

    TinySelections.setSelection(editor, [ 1, 0 ], 'T'.length, [ 1, 0 ], 'This is'.length);
    annotate(editor, 'alpha', 'id-two', { anything: 'comment-two' });

    TinySelections.setSelection(editor, [ 2, 0 ], 'This is the th'.length, [ 2, 0 ], 'This is the thir'.length);
    annotate(editor, 'beta', 'id-three', { something: 'comment-three' });
  });

  it('check initial content', () => {
    const editor = hook.editor();
    assertHtmlContent(editor, [
      '<p>This <span data-mce-annotation="alpha" data-test-anything="comment-1" data-mce-annotation-uid="id-one" class="mce-annotation">was</span> the first paragraph</p>',
      '<p>T<span data-mce-annotation="alpha" data-test-anything="comment-two" data-mce-annotation-uid="id-two" class="mce-annotation">his is</span> the second.</p>',
      '<p>This is the th<span data-mce-annotation="beta" data-test-something="comment-three" data-mce-annotation-uid="id-three" class="mce-annotation">ir</span>d.</p>'
    ]);
  });

  const outside1 = { path: [ 0, 0 ], offset: 'Th'.length };
  const inside1 = { path: [ 0, 1, 0 ], offset: 'i'.length };
  const inside3 = { path: [ 2, 1, 0 ], offset: 'i'.length };

  // Outside: p(0) > text(0) > "Th".length
  // Inside: p(0) > span(1) > text(0) > 'i'.length
  // Inside: p(1) > span(1) > text(0), 'hi'.length
  // Outside: p(1) > text(2) > ' the '.length
  it('outside1 selection', async () => {
    const editor = hook.editor();
    TinySelections.setSelection(editor, outside1.path, outside1.offset, outside1.path, outside1.offset);
    await Waiter.pTryUntil(
      'Nothing active (outside1)',
      () => TinyAssertions.assertContentPresence(editor, {
        '.mce-annotation': 3
      })
    );

    // There should be two alpha annotations
    assertGetAll(editor, {
      'id-one': 1,
      'id-two': 1
    }, 'alpha');

    // There should be one beta annotation
    assertGetAll(editor, {
      'id-three': 1
    }, 'beta');
  });

  it('remove first alpha annotation - outside annotation does nothing', async () => {
    const editor = hook.editor();
    TinySelections.setSelection(editor, outside1.path, outside1.offset, outside1.path, outside1.offset);
    editor.annotator.remove('alpha');

    // Need to wait because nothing should have changed. If we don't wait, we'll get
    // a false positive when the throttling makes the change delayed.
    await Waiter.pWait(500);

    await Waiter.pTryUntil(
      'removed alpha, but was not inside alpha',
      () => TinyAssertions.assertContentPresence(editor, {
        '.mce-annotation': 3
      })
    );

    // There should be still be two alpha annotations (because remove only works if you are inside,
    assertGetAll(editor, {
      'id-one': 1,
      'id-two': 1
    }, 'alpha');

    // There should still be one beta annotation
    assertGetAll(editor, {
      'id-three': 1
    }, 'beta');
  });

  it('remove beta annotation - inside annotation', async () => {
    const editor = hook.editor();
    TinySelections.setSelection(editor, inside3.path, inside3.offset, inside3.path, inside3.offset);
    editor.annotator.remove('beta');
    await Waiter.pTryUntil(
      'removed beta',
      () => TinyAssertions.assertContentPresence(editor, {
        '.mce-annotation': 2
      })
    );

    // There should be still be two alpha annotations (because cursor was inside beta)
    assertGetAll(editor, {
      'id-one': 1,
      'id-two': 1
    }, 'alpha');

    // There should be no beta annotations',
    assertGetAll(editor, {}, 'beta');

    // remove second alpha annotation - inside annotation
    TinySelections.setSelection(editor, inside1.path, inside1.offset, inside1.path, inside1.offset);
    editor.annotator.remove('alpha');

    await Waiter.pTryUntil(
      'removed alpha, and was inside alpha',
      () => TinyAssertions.assertContentPresence(editor, {
        '.mce-annotation': 1
      })
    );

    // There should now be just one alpha annotation (second one was removed)',
    assertGetAll(editor, {
      'id-two': 1
    }, 'alpha');
  });

  it('TINY-8195: remove alpha annotation and keep selection', () => {
    const editor = hook.editor();

    TinySelections.setCursor(editor, [ 0, 1, 0 ], 2);
    editor.annotator.remove('alpha');

    TinyAssertions.assertContentPresence(editor, {
      'span[data-mce-annotation="alpha"]': 1,
      'span[data-mce-annotation="beta"]': 1
    });
    TinyAssertions.assertCursor(editor, [ 0, 1 ], 2);
  });

  it('TINY-8195: remove all alpha annotations and keep selection', () => {
    const editor = hook.editor();

    TinySelections.setCursor(editor, [ 0, 2 ], 2);
    editor.annotator.removeAll('alpha');

    TinyAssertions.assertContentPresence(editor, {
      'span[data-mce-annotation="alpha"]': 0,
      'span[data-mce-annotation="beta"]': 1
    });
    TinyAssertions.assertCursor(editor, [ 0, 2 ], 2);
  });

  it('TINY-9399: remove annotation right after its creation', () => {
    const editor = hook.editor();
    editor.setContent('<p>This was the first paragraph</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 'This '.length, [ 0, 0 ], 'This was'.length);
    annotate(editor, 'alpha', 'id-one', { anything: 'comment-1' });
    TinyAssertions.assertContentPresence(editor, { 'span[data-mce-annotation="alpha"]': 1 });
    editor.annotator.remove('alpha');
    TinyAssertions.assertContentPresence(editor, { 'span[data-mce-annotation="alpha"]': 0 });
  });

  it('TINY-9467: Should remove annotations even if the selection is in a noneditable root', () => {
    TinyState.withNoneditableRootEditor(hook.editor(), (editor) => {
      editor.setContent('<p>test</p>');
      TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 4);
      annotate(editor, 'alpha', 'id-one', { anything: 'comment-1' });
      TinyAssertions.assertContentPresence(editor, { 'span[data-mce-annotation="alpha"]': 1 });
      editor.annotator.remove('alpha');
      TinyAssertions.assertContentPresence(editor, { 'span[data-mce-annotation="alpha"]': 0 });
    });
  });

  it('TINY-9467: Should remove all annotations even if the selection is in a noneditable root', () => {
    TinyState.withNoneditableRootEditor(hook.editor(), (editor) => {
      editor.setContent('<p>test</p>');
      TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 4);
      annotate(editor, 'alpha', 'id-one', { anything: 'comment-1' });
      TinyAssertions.assertContentPresence(editor, { 'span[data-mce-annotation="alpha"]': 1 });
      editor.annotator.removeAll('alpha');
      TinyAssertions.assertContentPresence(editor, { 'span[data-mce-annotation="alpha"]': 0 });
    });
  });
});
