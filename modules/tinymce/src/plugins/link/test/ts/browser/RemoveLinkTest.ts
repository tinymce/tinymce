import { context, describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks, TinySelections, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/link/Plugin';

describe('browser.tinymce.plugins.link.RemoveLinkTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'link',
    toolbar: 'unlink',
    base_url: '/project/tinymce/js/tinymce',
    indent: false
  }, [ Plugin ]);

  it('TBA: Removing a link with a collapsed selection', async () => {
    const editor = hook.editor();
    editor.setContent('<p><a href="http://tiny.cloud">tiny</a></p>');
    TinySelections.setCursor(editor, [ 0, 0, 0 ], 2);
    await TinyUiActions.pTriggerContextMenu(editor, 'a[href="http://tiny.cloud"]', '.tox-silver-sink [role="menuitem"]');
    TinyUiActions.clickOnUi(editor, 'div[title="Remove link"]');
    TinyAssertions.assertContentPresence(editor, { 'a[href="http://tiny.cloud"]': 0 });
  });

  it('TBA: Removing a link with some text selected', async () => {
    const editor = hook.editor();
    editor.setContent('<p><a href="http://tiny.cloud">tiny</a></p>');
    TinySelections.setSelection(editor, [ 0, 0, 0 ], 0, [ 0, 0, 0 ], 2);
    await TinyUiActions.pTriggerContextMenu(editor, 'a[href="http://tiny.cloud"]', '.tox-silver-sink [role="menuitem"]');
    TinyUiActions.clickOnUi(editor, 'div[title="Remove link"]');
    TinyAssertions.assertContentPresence(editor, { 'a[href="http://tiny.cloud"]': 0 });
  });

  it('TBA: Removing a link from an image', async () => {
    const editor = hook.editor();
    editor.setContent('<p><a href="http://tiny.cloud"><img src="http://moxiecode.cachefly.net/tinymce/v9/images/logo.png" /></a></p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 1);
    await TinyUiActions.pTriggerContextMenu(editor, 'a[href="http://tiny.cloud"]', '.tox-silver-sink [role="menuitem"]');
    TinyUiActions.clickOnUi(editor, 'div[title="Remove link"]');
    TinyAssertions.assertContentPresence(editor, { 'a[href="http://tiny.cloud"]': 0 });
  });

  it('TINY-4867: Removing multiple links in the selection', () => {
    const editor = hook.editor();
    editor.setContent('<p><a href="http://tiny.cloud">tiny</a> content <a href="http://tiny.cloud">link</a> with <a href="http://tiny.cloud">other</a></p>');
    TinySelections.setSelection(editor, [ 0, 0, 0 ], 1, [ 0, 4, 0 ], 2);
    TinyUiActions.clickOnToolbar(editor, 'button[title="Remove link"]');
    TinyAssertions.assertContentPresence(editor, { a: 0 });
    TinyAssertions.assertSelection(editor, [ 0, 0 ], 1, [ 0, 4 ], 2);
  });

  context('Block links', () => {
    it('TINY-9172: Removing root level link should convert it to regular text block', () => {
      const editor = hook.editor();
      editor.setContent('<a href="#"><p>tiny</p></a>');
      TinySelections.setCursor(editor, [ 0, 0, 0 ], 1);
      TinyUiActions.clickOnToolbar(editor, 'button[title="Remove link"]');
      TinyAssertions.assertContent(editor, '<p>tiny</p>');
      TinyAssertions.assertCursor(editor, [ 0, 0 ], 1);
    });

    it('TINY-9172: Removing wrapped block link should unwrap', () => {
      const editor = hook.editor();
      editor.setContent('<div><a href="#"><p>tiny</p></a></div>');
      TinySelections.setCursor(editor, [ 0, 0, 0, 0 ], 1);
      TinyUiActions.clickOnToolbar(editor, 'button[title="Remove link"]');
      TinyAssertions.assertContent(editor, '<div><p>tiny</p></div>');
      TinyAssertions.assertCursor(editor, [ 0, 0, 0 ], 1);
    });
  });
});
