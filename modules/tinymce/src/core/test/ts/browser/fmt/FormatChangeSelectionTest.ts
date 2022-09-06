import { Waiter } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.core.fmt.FormatChangeSelectionTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce'
  }, []);

  it('Check selection after removing part of an inline format', () => {
    const editor = hook.editor();
    editor.setContent('<p><em><strong>a </strong>b<strong> c</strong></em></p>');
    TinySelections.setSelection(editor, [ 0, 0, 1 ], 0, [ 0, 0, 2 ], 0);
    editor.execCommand('italic');
    TinyAssertions.assertContent(editor, '<p><em><strong>a </strong></em>b<em><strong> c</strong></em></p>');
    TinyAssertions.assertSelection(editor, [ 0, 1 ], 0, [ 0, 2 ], 0);
  });

  it('TINY-8935: should move start of selection to an editable text node after applying an inline format', () => {
    const editor = hook.editor();
    editor.setContent(`<p><strong>test</strong></p>`);
    TinySelections.select(editor, 'p', []);
    editor.execCommand('italic');
    TinyAssertions.assertContent(editor, `<p><em><strong>test</strong></em></p>`);
    TinyAssertions.assertSelection(editor, [ 0, 0, 0, 0 ], 0, [ 0, 0, 0 ], 1);
  });

  it('TINY-8935: should keep image node selected after applying an inline format', async () => {
    const editor = hook.editor();
    editor.setContent(`<p>before<img src="about:blank">after</p>`);
    TinySelections.select(editor, 'img', []);
    await Waiter.pTryUntil('image should be selected', () => TinyAssertions.assertContentPresence(editor, { 'img[data-mce-selected]': 1 }));
    editor.execCommand('italic');
    TinyAssertions.assertContent(editor, `<p>before<em><img src="about:blank"></em>after</p>`);
    TinyAssertions.assertSelection(editor, [ 0, 1 ], 0, [ 0, 1 ], 1);
    TinyAssertions.assertContentPresence(editor, { 'img[data-mce-selected]': 1 });
  });

  it('TINY-8935: should keep nonwrappable, noneditable node selected after applying an inline format', () => {
    const editor = hook.editor();
    const content = `<p>before <span contenteditable="false">test</span> after</p>`;

    editor.setContent(content);
    TinySelections.select(editor, 'span[contenteditable="false"]', []);
    TinyAssertions.assertSelection(editor, [ 0 ], 1, [ 0 ], 2);

    editor.execCommand('italic');

    TinyAssertions.assertContent(editor, content);
    TinyAssertions.assertSelection(editor, [ 0 ], 1, [ 0 ], 2);
    TinyAssertions.assertContentPresence(editor, { 'span[contenteditable="false"][data-mce-selected]': 1 });
  });

  it('TINY-8935: should keep wrappable, noneditable node selected after applying an inline format', () => {
    const editor = hook.editor();

    editor.setContent(`<p>before <span contenteditable="false" data-mce-cef-wrappable="true">test</span> after</p>`);
    TinySelections.select(editor, 'span[contenteditable="false"]', []);
    TinyAssertions.assertSelection(editor, [ 0 ], 1, [ 0 ], 2);

    editor.execCommand('italic');

    TinyAssertions.assertContent(editor, `<p>before <em><span contenteditable="false" data-mce-cef-wrappable="true">test</span></em> after</p>`);
    TinyAssertions.assertSelection(editor, [ 0, 1 ], 0, [ 0, 1 ], 1);
    TinyAssertions.assertContentPresence(editor, { 'span[contenteditable="false"][data-mce-selected]': 1 });
  });

  it('TINY-8935: should keep wrappable, noneditable node selected after removing an inline format', () => {
    const editor = hook.editor();

    editor.setContent(`<p>before <em><span contenteditable="false" data-mce-cef-wrappable="true">test</span></em> after</p>`);
    TinySelections.select(editor, 'span[contenteditable="false"]', []);
    TinyAssertions.assertSelection(editor, [ 0, 1 ], 0, [ 0, 1 ], 1);

    editor.execCommand('italic');

    TinyAssertions.assertContent(editor, `<p>before <span contenteditable="false" data-mce-cef-wrappable="true">test</span> after</p>`);
    TinyAssertions.assertSelection(editor, [ 0 ], 1, [ 0 ], 2);
    TinyAssertions.assertContentPresence(editor, { 'span[contenteditable="false"][data-mce-selected]': 1 });
  });

  it('TINY-8935: should not move the start of selection inside of the noneditable node after applying an inline format', () => {
    const editor = hook.editor();

    editor.setContent(`<p>before <span contenteditable="false" data-mce-cef-wrappable="true">test</span> after</p>`);
    // Create a ranged selection so that there is not text before and some text after
    TinySelections.setSelection(editor, [ 0, 0 ], 'before '.length, [ 0, 2 ], ' a'.length);

    editor.execCommand('italic');

    // start should remain on the <em> node as there is no text to move it too and can't move it into the noneditable node
    TinyAssertions.assertContent(editor, `<p>before <em><span contenteditable="false" data-mce-cef-wrappable="true">test</span> a</em>fter</p>`);
    TinyAssertions.assertSelection(editor, [ 0 ], 1, [ 0 ], 2);
  });

  it('TINY-8935: should not move the start of selection inside of the noneditable node after removing an inline format', () => {
    const editor = hook.editor();

    editor.setContent(`<p>before <em><span contenteditable="false" data-mce-cef-wrappable="true">test</span> a</em>fter</p>`);
    // Create a ranged selection so that there is not text before and some text after
    TinySelections.setSelection(editor, [ 0, 1 ], 0, [ 0, 1, 1 ], ' a'.length);

    editor.execCommand('italic');

    // start should remain on the span node as there is no text to move it too and can't move it into the noneditable node
    TinyAssertions.assertContent(editor, `<p>before <span contenteditable="false" data-mce-cef-wrappable="true">test</span> after</p>`);
    TinyAssertions.assertSelection(editor, [ 0 ], 1, [ 0, 2 ], 2);
  });
});
