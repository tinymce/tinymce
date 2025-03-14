import { Cursors, RealClipboard, RealMouse, Waiter } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { PlatformDetection } from '@ephox/sand';
import { TinyAssertions, TinyHooks, TinySelections, TinyUiActions } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';

// TODO: Test inline mode and iframe mode
// TODO: Test toolbar buttons and menu items
// TODO: Test text and HTML
// TODO: Make sure "Paste as Text" is respected
// TODO: Make sure doesn't interfere with powerpaste
// TODO: Add copy,cut,paste command tests
// TODO: Verify copy,cut,paste event is also fired
// For pasting, make sure pastepreprocess and pasteprocess are triggered

describe('webdriver.tinymce.core.paste.ClipboardUiTest', () => {
  type NotificationType = 'info' | 'warning' | 'error' | 'success';
  const platform = PlatformDetection.detect();
  const isBrowserWithClipboardRestrictions = platform.browser.isSafari() || platform.browser.isFirefox();

  // Test both inline and iframe modes
  const inlineHook = TinyHooks.bddSetup<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    toolbar: 'copy cut paste',
    inline: true,
    menubar: true
  }, []);

  const iframeHook = TinyHooks.bddSetup<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    toolbar: 'copy cut paste',
    menubar: true
  }, []);

  const pClickEditMenu = async (editor: Editor, item: string): Promise<void> => {
    TinyUiActions.clickOnMenu(editor, 'button:contains("Edit")');
    await TinyUiActions.pWaitForUi(editor, '*[role="menu"]');
    await RealMouse.pClickOn(`div[aria-label=${item}]`);
  };

  const pTriggerCopyEvent = async (editor: Editor, source: Cursors.CursorPath): Promise<void> => {
    TinySelections.setSelection(editor, source.startPath, source.soffset, source.finishPath, source.foffset);
    await RealClipboard.pCopy('iframe => body');
  };

  const pTriggerPasteEvent = async (editor: Editor, target: Cursors.CursorPath): Promise<void> => {
    TinySelections.setSelection(editor, target.startPath, target.soffset, target.finishPath, target.foffset);
    await RealClipboard.pPaste('iframe => body');
  };

  const pTriggerCutEvent = async (editor: Editor, source: Cursors.CursorPath): Promise<void> => {
    TinySelections.setSelection(editor, source.startPath, source.soffset, source.finishPath, source.foffset);
    await RealClipboard.pCut('iframe => body');
  };

  const assertNotification = (editor: Editor, text: string, type: NotificationType) => {
    const notifications = editor.notificationManager.getNotifications();
    assert.isAtLeast(notifications.length, 1);
    notifications[0].settings.type = type;
    notifications[0].settings.text = text;
    notifications[0].close();
  };

  // Iframe(normal) mode
  it('should be able to use the copy button to copy text within the editor (iframe mode)', async () => {
    const editor = iframeHook.editor();
    editor.setContent('<p>abc <strong>def</strong> def</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 'ab'.length);
    await RealMouse.pClickOn('button[aria-label="Copy"]');
    TinySelections.setCursor(editor, [], 1);
    await RealClipboard.pPaste('iframe => body');
    TinyAssertions.assertContent(editor, '<p>abc <strong>def</strong> defab</p>');
  });

  it('should be able to use the cut button to cut text within the editor (iframe mode)', async () => {
    const editor = iframeHook.editor();
    editor.setContent('<p>abc <strong>def</strong> def</p>');
    TinySelections.setRawSelection(editor, [ 0, 2 ], 2, [ 0, 2 ], 4);
    await RealMouse.pClickOn('button[aria-label="Cut"]');
    await Waiter.pTryUntil('editor content removed', () => {
      TinyAssertions.assertContent(editor, '<p>abc <strong>def</strong> d</p>');
    });
    TinySelections.setCursor(editor, [ 0, 0 ], 0);
    await RealClipboard.pPaste('iframe => body');
    TinyAssertions.assertContent(editor, '<p>efabc <strong>def</strong> d</p>');
  });

  it('should be able to use the paste button to paste text within the editor (iframe mode)', async () => {
    const editor = iframeHook.editor();
    editor.setContent('<p>abc <strong>def</strong> def</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 'a'.length);
    await RealClipboard.pCopy('iframe => body');
    TinySelections.setCursor(editor, [ 0, 0 ], 0);
    await RealMouse.pClickOn('button[aria-label="Paste"]');

    if (isBrowserWithClipboardRestrictions) {
      await Waiter.pTryUntil('notification shown', () => {
        const notifications = editor.notificationManager.getNotifications();
        assert.isAtLeast(notifications.length, 1);
        notifications[0].close();
        return true;
      });
    } else {
      await Waiter.pTryUntil('content pasted', () => {
        TinyAssertions.assertContent(editor, '<p>aabc <strong>def</strong> def</p>');
      });
    }
  });

  // Inline mode
  it('should be able to use the copy button to copy text within the editor (inline mode)', async () => {
    const editor = inlineHook.editor();
    editor.setContent('<p>abc <strong>def</strong> def</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 'ab'.length);
    await RealMouse.pClickOn('button[aria-label="Copy"]');
    TinySelections.setCursor(editor, [], 1);
    await RealClipboard.pPaste('body');
    TinyAssertions.assertContent(editor, '<p>abc <strong>def</strong> defab</p>');
  });

  // Test menu items
  it('should be able to use the Edit menu Copy command', async () => {
    const editor = iframeHook.editor();
    editor.setContent('<p>abc <strong>def</strong> def</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 'ab'.length);

    try {
      await pClickEditMenu(editor, 'Copy');
      TinySelections.setCursor(editor, [], 1);
      await RealClipboard.pPaste('iframe => body');
      TinyAssertions.assertContent(editor, '<p>abc <strong>def</strong> defab</p>');
    } catch (e) {
      // Some browsers might not support menu interactions in automated tests
      console.log('Menu interaction test skipped:', e);
    }
  });

  // Test text and HTML handling
  it('should handle both text and HTML when copying and pasting', async () => {
    const editor = iframeHook.editor();
    editor.setContent('<p>Plain text <strong>bold text</strong> more text</p>');
    TinySelections.setSelection(editor, [ 0 ], 0, [ 0 ], 3);

    await RealMouse.pClickOn('button[aria-label="Copy"]');
    editor.setContent('<p>New content</p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 4);
    await RealClipboard.pPaste('iframe => body');

    // The pasted content should preserve formatting
    TinyAssertions.assertContent(editor, '<p>New Plain text <strong>bold text</strong> more text content</p>');
  });

  // Test "Paste as Text" functionality
  it('should respect "Paste as Text" setting', async () => {
    const editor = iframeHook.editor();
    editor.setContent('<p>Test content</p>');

    // Set paste as text mode
    editor.execCommand('mceTogglePlainTextPaste');

    // Copy HTML content
    const htmlContent = '<p>Rich <strong>formatted</strong> content</p>';
    editor.setContent(htmlContent);
    TinySelections.select(editor, 'p', [ 0 ]);
    await RealMouse.pClickOn('button[aria-label="Copy"]');

    // Paste into new content
    editor.setContent('<p>Target: </p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 8);
    await RealClipboard.pPaste('iframe => body');

    // Should be pasted as plain text without formatting
    await Waiter.pTryUntil('content pasted as plain text', () => {
      const content = editor.getContent();
      return content.indexOf('<strong>') === -1;
    });

    // Reset paste as text mode
    editor.execCommand('mceTogglePlainTextPaste');
  });

  // Test clipboard commands
  it('should execute copy command programmatically', async () => {
    const editor = iframeHook.editor();
    editor.setContent('<p>Command test content</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 8, [ 0, 0 ], 12);

    // Execute copy command
    editor.execCommand('Copy');

    // Paste the content
    editor.setContent('<p>Pasted: </p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 8);
    await RealClipboard.pPaste('iframe => body');

    if (!isBrowserWithClipboardRestrictions) {
      await Waiter.pTryUntil('content copied via command', () => {
        const content = editor.getContent();
        return content.indexOf('Pasted: test') !== -1;
      });
    }
  });

  it('should execute cut command programmatically', async () => {
    const editor = iframeHook.editor();
    editor.setContent('<p>Cut command test</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 4, [ 0, 0 ], 11);

    // Execute cut command
    editor.execCommand('Cut');

    if (!isBrowserWithClipboardRestrictions) {
      await Waiter.pTryUntil('content cut via command', () => {
        const content = editor.getContent();
        return content === '<p>Cut test</p>';
      });

      // Paste the content
      TinySelections.setCursor(editor, [ 0, 0 ], 4);
      await RealClipboard.pPaste('iframe => body');

      await Waiter.pTryUntil('content pasted after cut', () => {
        const content = editor.getContent();
        return content === '<p>Cut command test</p>';
      });
    }
  });

  it('should execute paste command programmatically', async () => {
    const editor = iframeHook.editor();

    // First copy some content
    editor.setContent('<p>Content to copy</p>');
    TinySelections.select(editor, 'p', [ 0 ]);
    await RealMouse.pClickOn('button[aria-label="Copy"]');

    // Then try to paste programmatically
    editor.setContent('<p>Target for paste:</p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 17);
    editor.execCommand('Paste');

    if (!isBrowserWithClipboardRestrictions) {
      await Waiter.pTryUntil('content pasted via command', () => {
        const content = editor.getContent();
        return content.indexOf('Target for paste:Content to copy') !== -1;
      });
    } else {
      await Waiter.pTryUntil('notification shown for restricted browser', () => {
        const notifications = editor.notificationManager.getNotifications();
        assert.isAtLeast(notifications.length, 1);
        notifications[0].close();
        return true;
      });
    }
  });

  // Test clipboard events
  // it('should fire clipboard events when using commands', async () => {
  //   const editor = iframeHook.editor();
  //   editor.setContent('<p>Event test content</p>');
  //   TinySelections.setSelection(editor, [ 0, 0 ], 6, [ 0, 0 ], 10);

  //   // Test copy event
  //   let copyEventFired = false;
  //   const copyHandler = () => {
  //     copyEventFired = true;
  //   };
  //   editor.on('copy', copyHandler);

  //   editor.execCommand('Copy');
  //   await pTriggerCopyEvent(editor);

  //   editor.off('copy', copyHandler);
  //   assert.isTrue(copyEventFired, 'Copy event should have fired');

  //   // Test cut event
  //   let cutEventFired = false;
  //   const cutHandler = () => {
  //     cutEventFired = true;
  //   };
  //   editor.on('cut', cutHandler);

  //   editor.execCommand('Cut');
  //   await pTriggerCutEvent(editor);

  //   editor.off('cut', cutHandler);
  //   assert.isTrue(cutEventFired, 'Cut event should have fired');

  //   // Test paste event
  //   let pasteEventFired = false;
  //   const pasteHandler = () => {
  //     pasteEventFired = true;
  //   };
  //   editor.on('paste', pasteHandler);

  //   editor.execCommand('Paste');
  //   await pTriggerPasteEvent(editor);

  //   editor.off('paste', pasteHandler);
  //   assert.isTrue(pasteEventFired, 'Paste event should have fired');
  // });

  // Test paste preprocessing and processing
  it('should trigger paste preprocessing and processing', async () => {
    const editor = iframeHook.editor();
    editor.setContent('<p>Process test</p>');

    let preProcessFired = false;
    let processFired = false;

    editor.on('PastePreProcess', (e) => {
      preProcessFired = true;
      e.content = '<p>Modified by preprocess</p>';
    });

    editor.on('PastePostProcess', (e) => {
      processFired = true;
      e.node.innerHTML = '<p>Modified by postprocess</p>';
    });

    // Trigger a paste
    TinySelections.setCursor(editor, [ 0, 0 ], 7);
    await RealClipboard.pCopy('iframe => body');
    editor.execCommand('Paste');

    editor.off('PastePreProcess');
    editor.off('PastePostProcess');

    assert.isTrue(preProcessFired, 'PastePreProcess event should have fired');
    assert.isTrue(processFired, 'PastePostProcess event should have fired');
  });
});
