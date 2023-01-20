import { Keys, Mouse, UiFinder, Waiter } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { SugarShadowDom } from '@ephox/sugar';
import { TinyAssertions, TinyDom, TinyHooks, TinySelections, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/image/Plugin';

describe('browser.tinymce.plugins.image.ContextMenuTest', () => {
  const hook = TinyHooks.bddSetup<Editor>({
    plugins: 'image link',
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

  // eslint-disable-next-line mocha/no-exclusive-tests
  it.only('TINY-9491: Opening context menus on a selected figure', async () => {
    const editor = hook.editor();
    editor.setContent(
      '<div contenteditable="false">' +
        '<h2 contenteditable="true">Table</h2>' +
        '<ul>' +
          '<li>' +
            '<a href="#mcetoc_1gmi3gu5b11" data-mce-href="#mcetoc_1gmi3gu5b11">point </a>' +
          '</li>' +
        '</ul>' +
      '</div>' +
      '<h2 id="mcetoc_1gmi3gu5b12">point</h2>',
      { format: 'raw' }
    );
    Mouse.contextMenuOn(TinyDom.body(editor), 'a');
    await Waiter.pWait(250); // Give plenty of time for the context menu to appear
    UiFinder.notExists(SugarShadowDom.getContentContainer(SugarShadowDom.getRootNode(TinyDom.targetElement(editor))), '.tox-silver-sink [role="menuitem"]');
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
});
