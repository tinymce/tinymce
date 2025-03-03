import { RealClipboard, RealMouse, Waiter } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
// import { PlatformDetection } from '@ephox/sand';
import { TinyAssertions, TinyHooks, TinySelections, TinyUiActions } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';

// TODO: Test inline mode and iframe mode
// TODO: Test toolbar buttons and menu items
// TODO: Test text and HTML
// TODO: Make sure "Paste as Text" is respected
// TODO: Make sure doesn't interfere with powerpaste

describe('webdriver.tinymce.core.paste.ClipboardUiTest', () => {
  const hook = TinyHooks.bddSetup<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    toolbar: 'copy cut paste'
  }, []);
  // const platform = PlatformDetection.detect();

  const assertNotification = (editor: Editor) => {
    const notifications = editor.notificationManager.getNotifications();
    assert.lengthOf(notifications, 1);
    notifications[0].settings.type = 'error';
    notifications[0].settings.text = 'error';
    notifications[0].close();
  };

  // const pClickEditMenu = async (editor: Editor, item: string): Promise<void> => {
  //   TinyUiActions.clickOnMenu(editor, 'button:contains("Edit")');
  //   await TinyUiActions.pWaitForUi(editor, '*[role="menu"]');
  //   await RealMouse.pClickOn(`div[aria-label=${item}]`);
  // };

  it('should be able to use the copy button to copy text within the editor', async () => {
    const editor = hook.editor();
    editor.setContent('<p>abc <strong>def</strong> def</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 'ab'.length);
    await RealMouse.pClickOn('button[aria-label="Copy"]');
    TinySelections.setCursor(editor, [], 1);
    await RealClipboard.pPaste('iframe => body');
    TinyAssertions.assertContent(editor, '<p>abc <strong>def</strong> defab</p>');
  });

  it('should be able to use the cut button to cut text within the editor', async () => {
    const editor = hook.editor();
    editor.setContent('<p>abc <strong>def</strong> def</p>');
    TinySelections.setRawSelection(editor, [ 0, 2 ], 2, [ 0, 2], 4);
    await RealMouse.pClickOn('button[aria-label="Cut"]');
    await Waiter.pTryUntil('editor content removed', () => {
      TinyAssertions.assertContent(editor, '<p>abc <strong>def</strong> d</p>');
    });
    TinySelections.setCursor(editor, [ 0, 0 ], 0);
    await RealClipboard.pPaste('iframe => body');
    TinyAssertions.assertContent(editor, '<p>efabc <strong>def</strong> d</p>');
  });

  it('should be able to use the paste button to paste text within the editor', async () => {
    const editor = hook.editor();
    editor.setContent('<p>abc <strong>def</strong> def</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 'a'.length);
    await RealClipboard.pCopy('iframe => body');
    TinySelections.setCursor(editor, [ 0, 0 ], 0);
    await RealMouse.pClickOn('button[aria-label="Paste"]');
    // if (platform.browser.isFirefox()) {
    //   await Waiter.pTryUntil('content not pasted', () => {
    //     assertNotification(editor);
    //   });
    // } else {
    //   await Waiter.pTryUntil('content pasted', () => {
    //     TinyAssertions.assertContent(editor, '<p>abcabc <strong>def</strong> defabc</p>');
    //   });
    // }
    await Waiter.pTryUntil('content pasted', () => {
      TinyAssertions.assertContent(editor, '<p>aabc <strong>def</strong> def</p>');
    });
  });
});
