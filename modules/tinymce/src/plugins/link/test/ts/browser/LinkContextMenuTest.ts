import { FocusTools, Keys, Waiter } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { SugarDocument } from '@ephox/sugar';
import { TinyAssertions, TinyHooks, TinySelections, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/link/Plugin';

describe('browser.tinymce.plugins.link.LinkContextMenuTest', () => {
  const hook = TinyHooks.bddSetup<Editor>({
    plugins: 'link',
    toolbar: 'link',
    base_url: '/project/tinymce/js/tinymce',
  }, [ Plugin ]);

  const pAssertFocusOnItem = (label: string, selector: string) =>
    FocusTools.pTryOnSelector(`Focus should be on: ${label}`, SugarDocument.getDocument(), selector);

  const pressDownArrowKey = (editor: Editor) => TinyUiActions.keydown(editor, Keys.down());

  const pTestContextMenuItems = async (editor: Editor) => {
    await pAssertFocusOnItem('Link...', '.tox-collection__item:contains("Link...")');
    pressDownArrowKey(editor);
    await pAssertFocusOnItem('Remove link', '.tox-collection__item:contains("Remove link")');
    pressDownArrowKey(editor);
    await pAssertFocusOnItem('Open link', '.tox-collection__item:contains("Open link")');
  };

  it('TINY-2293: Context menu shows up on links', async () => {
    const editor = hook.editor();
    editor.setContent('<p><a href="http://tiny.cloud">tiny</a></p>');
    await TinyUiActions.pTriggerContextMenu(editor, 'a[href="http://tiny.cloud"]', '.tox-silver-sink [role="menuitem"]');
    await pTestContextMenuItems(editor);
  });

  it('TINY-7993: Context menu shows correctly right after inserting a link', async () => {
    const editor = hook.editor();
    editor.setContent('<p>aaa bbb ccc</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 'aaa '.length, [ 0, 0 ], 'aaa bbb'.length);
    editor.execCommand('mceLink');
    await TinyUiActions.pWaitForDialog(editor);
    FocusTools.setActiveValue(SugarDocument.getDocument(), 'http://tiny.cloud');
    TinyUiActions.submitDialog(editor);
    await Waiter.pTryUntil('Wait for content to change', () =>
      TinyAssertions.assertContent(editor, '<p>aaa <a href="http://tiny.cloud">bbb</a> ccc</p>'));
    await TinyUiActions.pTriggerContextMenu(editor, 'a[href="http://tiny.cloud"]', '.tox-silver-sink [role="menuitem"]');
    await pTestContextMenuItems(editor);
    await pAssertFocusOnItem('Open link', '.tox-collection__item:contains("Open link"):not([aria-disabled="true"])');
  });
});
