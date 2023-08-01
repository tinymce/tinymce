import { Keys, Mouse, Waiter } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyDom, TinyHooks, TinySelections, TinyUiActions } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/image/Plugin';

describe('browser.tinymce.plugins.image.ContextMenuTest', () => {
  const hook = TinyHooks.bddSetup<Editor>({
    plugins: 'image',
    toolbar: 'image',
    indent: false,
    base_url: '/project/tinymce/js/tinymce',
    image_caption: true
  }, [ Plugin ], true);

  const pOpenContextMenu = async (editor: Editor, target: string) => {
    // Not sure why this is needed, but without the browser deselects the contextmenu target
    await Waiter.pWait(0);
    await TinyUiActions.pTriggerContextMenu(editor, target, '.tox-silver-sink [role="menuitem"]');
  };

  const pWaitForAndSubmitDialog = async (editor: Editor) => {
    await TinyUiActions.pWaitForDialog(editor);
    TinyUiActions.submitDialog(editor);
  };

  it('TBA: Opening context menus on a selected figure', async () => {
    const editor = hook.editor();
    editor.setContent('<figure class="image" contenteditable="false"><img src="image.png"><figcaption contenteditable="true">Caption</figcaption></figure><p>Second paragraph</p>', { format: 'raw' });
    // Note: A fake caret will be the first element in the dom
    TinySelections.setSelection(editor, [], 1, [], 2);
    await pOpenContextMenu(editor, 'figure.image');
    TinyUiActions.keydown(editor, Keys.enter());
    await pWaitForAndSubmitDialog(editor);
    TinyAssertions.assertSelection(editor, [], 0, [], 1);
  });

  it('TBA: Opening context menus on an unselected figure', async () => {
    const editor = hook.editor();
    editor.setContent('<figure class="image" contenteditable="false"><img src="image.png"><figcaption contenteditable="true">Caption</figcaption></figure><p>Second paragraph</p>', { format: 'raw' });
    // Note: A fake caret will be the first element in the dom
    TinySelections.setCursor(editor, [ 2, 0 ], 1);
    await pOpenContextMenu(editor, 'figure.image');
    TinyUiActions.keydown(editor, Keys.enter());
    await pWaitForAndSubmitDialog(editor);
    TinyAssertions.assertSelection(editor, [], 0, [], 1);
  });

  it('TBA: Opening context menus on a selected image', async () => {
    const editor = hook.editor();
    editor.setContent('<p><img src="image.png" /></p><p>Second paragraph</p>', { format: 'raw' });
    TinySelections.setSelection(editor, [ 0 ], 0, [ 0 ], 1);
    await pOpenContextMenu(editor, 'img');
    TinyUiActions.keydown(editor, Keys.enter());
    await pWaitForAndSubmitDialog(editor);
    TinyAssertions.assertSelection(editor, [ 0 ], 0, [ 0 ], 1);
  });

  it('TBA: Opening context menus on an unselected image', async () => {
    const editor = hook.editor();
    editor.setContent('<p><img src="image.png" /></p><p>Second paragraph</p>', { format: 'raw' });
    TinySelections.setSelection(editor, [ 1, 0 ], 1, [ 1, 0 ], 1);
    await pOpenContextMenu(editor, 'img');
    TinyUiActions.keydown(editor, Keys.enter());
    await pWaitForAndSubmitDialog(editor);
    TinyAssertions.assertSelection(editor, [ 0 ], 0, [ 0 ], 1);
  });

  it('TINY-10016: Opening context menus on a selected image in non-editable context', () => {
    const editor = hook.editor();
    editor.getBody().contentEditable = 'false';
    editor.setContent('<p><img src="image.png" /></p><p>Second paragraph</p>', { format: 'raw' });
    TinySelections.setSelection(editor, [ 0 ], 0, [ 0 ], 1);
    Mouse.contextMenuOn(TinyDom.body(editor), 'img');
    assert.isEmpty(document.querySelector('.tox-silver-sink')?.children);
    TinyAssertions.assertSelection(editor, [ 0 ], 0, [ 0 ], 1);
    editor.getBody().contentEditable = 'true';
  });

  it('TINY-10016: Opening context menus on an unselected image in non-editable context', () => {
    const editor = hook.editor();
    editor.getBody().contentEditable = 'false';
    editor.setContent('<p><img src="image.png" /></p><p>Second paragraph</p>', { format: 'raw' });
    TinySelections.setSelection(editor, [ 1, 0 ], 1, [ 1, 0 ], 1);
    Mouse.contextMenuOn(TinyDom.body(editor), 'img');
    assert.isEmpty(document.querySelector('.tox-silver-sink')?.children);
    TinyAssertions.assertSelection(editor, [ 0 ], 0, [ 0 ], 1);
    editor.getBody().contentEditable = 'true';
  });

});
