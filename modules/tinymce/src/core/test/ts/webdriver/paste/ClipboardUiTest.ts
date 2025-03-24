/* eslint-disable no-console */
import { Cursors, RealClipboard, RealMouse, Waiter } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { PlatformDetection } from '@ephox/sand';
import { TinyAssertions, TinyHooks, TinySelections, TinyUiActions } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';

describe('webdriver.tinymce.core.paste.ClipboardUiTest', () => {
  const platform = PlatformDetection.detect();
  const isBrowserWithPasteRestrictions = platform.browser.isSafari() || platform.browser.isFirefox();
  const isChromium = platform.browser.isChromium();

  const testContent = '<p>abc <strong>def</strong> def</p>';
  const testSelection = { startPath: [ 0, 0 ], soffset: 0, finishPath: [ 0, 0 ], foffset: 'ab'.length };

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

  const ClipboardUtils = {
    pClickEditMenu: async (editor: Editor, item: string): Promise<void> => {
      TinyUiActions.clickOnMenu(editor, 'button:contains("Edit")');
      await TinyUiActions.pWaitForUi(editor, '*[role="menu"]');
      await RealMouse.pClickOn(`div[aria-label=${item}]`);
    },

    pTriggerCopyEvent: async (editor: Editor, source: Cursors.CursorPath): Promise<void> => {
      TinySelections.setSelection(editor, source.startPath, source.soffset, source.finishPath, source.foffset);
      await RealClipboard.pCopy('iframe => body');
    },

    pTriggerPasteEvent: async (editor: Editor, target: Cursors.CursorPath): Promise<void> => {
      TinySelections.setSelection(editor, target.startPath, target.soffset, target.finishPath, target.foffset);
      await RealClipboard.pPaste('iframe => body');
    },

    pTriggerCutEvent: async (editor: Editor, source: Cursors.CursorPath): Promise<void> => {
      TinySelections.setSelection(editor, source.startPath, source.soffset, source.finishPath, source.foffset);
      await RealClipboard.pCut('iframe => body');
    }
  };

  const assertNotification = async (editor: Editor, text: string, type: 'info' | 'warning' | 'error' | 'success'): Promise<void> => {
    await Waiter.pTryUntil('notification shown', () => {
      const notifications = editor.notificationManager.getNotifications();
      assert.isAtLeast(notifications.length, 1);
      assert.equal(notifications[0].settings.type, type);
      assert.isTrue(notifications[0].settings.text.startsWith('Your browser restricts clipboard access. Please use keyboard shortcut'));
      notifications[0].close();
      return true;
    });
  };

  const setupTestContent = (editor: Editor): void => {
    editor.setContent(testContent);
    TinySelections.setSelection(editor, testSelection.startPath, testSelection.soffset, testSelection.finishPath, testSelection.foffset);
  };

  const assertPastedContent = async (editor: Editor, expectedContent: string): Promise<void> => {
    await Waiter.pTryUntil('content pasted', () => {
      TinyAssertions.assertContent(editor, expectedContent);
    });
  };

  describe('Toolbar buttons', () => {
    describe('Copy button', () => {
      it('should copy text within the editor (iframe mode)', async () => {
        const editor = iframeHook.editor();
        setupTestContent(editor);
        await RealMouse.pClickOn('button[aria-label="Copy"]');
        TinySelections.setCursor(editor, [], 1);
        await RealClipboard.pPaste('iframe => body');

        if (isChromium) {
          await assertPastedContent(editor, '<p>abc <strong>def</strong> defab</p>');
        } else if (isBrowserWithPasteRestrictions) {
          await assertNotification(editor, 'Your browser restricts clipboard access. Please use keyboard shortcut', 'info');
        }
      });

      it('should copy text within the editor (inline mode)', async () => {
        const editor = inlineHook.editor();
        setupTestContent(editor);
        await RealMouse.pClickOn('button[aria-label="Copy"]');
        TinySelections.setCursor(editor, [], 1);
        await RealClipboard.pPaste('body');

        if (isChromium) {
          await assertPastedContent(editor, '<p>abc <strong>def</strong> defab</p>');
        } else if (isBrowserWithPasteRestrictions) {
          await assertNotification(editor, 'Your browser restricts clipboard access. Please use keyboard shortcut', 'info');
        }
      });
    });

    describe('Cut button', () => {
      it('should cut text within the editor (iframe mode)', async () => {
        const editor = iframeHook.editor();
        setupTestContent(editor);
        await RealMouse.pClickOn('button[aria-label="Cut"]');
        await Waiter.pTryUntil('editor content removed', () => {
          TinyAssertions.assertContent(editor, '<p>abc <strong>def</strong> d</p>');
        });

        TinySelections.setCursor(editor, [ 0, 0 ], 0);
        await RealClipboard.pPaste('iframe => body');

        if (isChromium) {
          await assertPastedContent(editor, '<p>efabc <strong>def</strong> d</p>');
        } else if (isBrowserWithPasteRestrictions) {
          await assertNotification(editor, 'Your browser restricts clipboard access. Please use keyboard shortcut', 'info');
        }
      });
    });

    describe('Paste button', () => {
      // TODO: This test is failing because the clipboard permissions are not set correctly.
      it('should paste text within the editor (iframe mode)', async () => {
        const editor = iframeHook.editor();
        setupTestContent(editor);
        await RealClipboard.pCopy('iframe => body');
        TinySelections.setCursor(editor, [ 0, 0 ], 0);
        await RealMouse.pClickOn('button[aria-label="Paste"]');

        if (isChromium) {
          await assertPastedContent(editor, '<p>aabc <strong>def</strong> def</p>');
        } else if (isBrowserWithPasteRestrictions) {
          await assertNotification(editor, 'Your browser restricts clipboard access. Please use keyboard shortcut', 'info');
        }
      });
    });
  });

  describe('Edit menu commands', () => {
    it('should use Copy command from Edit menu', async () => {
      const editor = iframeHook.editor();
      setupTestContent(editor);
      await ClipboardUtils.pClickEditMenu(editor, 'Copy');
      TinySelections.setCursor(editor, [], 1);
      await RealClipboard.pPaste('iframe => body');

      if (isChromium) {
        await assertPastedContent(editor, '<p>abc <strong>def</strong> defab</p>');
      } else if (isBrowserWithPasteRestrictions) {
        await assertNotification(editor, 'Your browser restricts clipboard access. Please use keyboard shortcut', 'info');
      }
    });

    // TODO: This test is failing because the clipboard permissions are not set correctly.
    it('should use Cut command from Edit menu', async () => {
      const editor = iframeHook.editor();
      setupTestContent(editor);
      await ClipboardUtils.pClickEditMenu(editor, 'Cut');
      await Waiter.pTryUntil('content cut', () => {
        TinyAssertions.assertContent(editor, '<p><strong>def</strong> def</p>');
      });
    });

    it('should use Paste command from Edit menu', async () => {
      const editor = iframeHook.editor();
      setupTestContent(editor);
      await RealClipboard.pCopy('iframe => body');
      TinySelections.setCursor(editor, [ 0, 0 ], 0);
      await ClipboardUtils.pClickEditMenu(editor, 'Paste');

      if (isChromium) {
        await assertPastedContent(editor, '<p>ababc <strong>def</strong> def</p>');
      } else if (isBrowserWithPasteRestrictions) {
        await assertNotification(editor, 'Your browser restricts clipboard access. Please use keyboard shortcut', 'info');
      }
    });
  });

  describe('Content handling', () => {
    it('should handle both text and HTML when copying and pasting', async () => {
      const editor = iframeHook.editor();
      editor.setContent('<p>Plain text <strong>bold text</strong> more text</p>');
      TinySelections.setSelection(editor, [ 0 ], 0, [ 0 ], 3);

      await RealMouse.pClickOn('button[aria-label="Copy"]');
      editor.setContent('<p>New content</p>');
      TinySelections.setCursor(editor, [ 0, 0 ], 4);
      await RealClipboard.pPaste('iframe => body');

      if (isChromium) {
        await assertPastedContent(editor, '<p>New Plain text <strong>bold text</strong> more text content</p>');
      } else if (isBrowserWithPasteRestrictions) {
        await assertNotification(editor, 'Your browser restricts clipboard access. Please use keyboard shortcut', 'info');
      }
    });

    it('should respect "Paste as Text" setting', async () => {
      const editor = iframeHook.editor();
      editor.setContent('<p>Test content</p>');

      editor.execCommand('mceTogglePlainTextPaste');

      const htmlContent = '<p>Rich <strong>formatted</strong> content</p>';
      editor.setContent(htmlContent);
      TinySelections.select(editor, 'p', [ 0 ]);
      await RealMouse.pClickOn('button[aria-label="Copy"]');

      editor.setContent('<p>Target: </p>');
      TinySelections.setCursor(editor, [ 0, 0 ], 8);
      await RealClipboard.pPaste('iframe => body');

      if (isChromium) {
        await Waiter.pTryUntil('content pasted as plain text', () => {
          const content = editor.getContent();
          return content.indexOf('<strong>') === -1;
        });
      } else if (isBrowserWithPasteRestrictions) {
        await assertNotification(editor, 'Your browser restricts clipboard access. Please use keyboard shortcut', 'info');
      }

      editor.execCommand('mceTogglePlainTextPaste');
    });
  });

  describe('Programmatic commands', () => {
    it('should execute copy command programmatically', async () => {
      const editor = iframeHook.editor();
      editor.setContent('<p>Command test content</p>');
      TinySelections.setSelection(editor, [ 0, 0 ], 8, [ 0, 0 ], 12);

      editor.execCommand('Copy');

      editor.setContent('<p>Pasted: </p>');
      TinySelections.setCursor(editor, [ 0, 0 ], 8);
      await RealClipboard.pPaste('iframe => body');

      if (isChromium) {
        await Waiter.pTryUntil('content copied via command', () => {
          const content = editor.getContent();
          return content.indexOf('Pasted: test') !== -1;
        });
      } else if (isBrowserWithPasteRestrictions) {
        await assertNotification(editor, 'Your browser restricts clipboard access. Please use keyboard shortcut', 'info');
      }
    });

    it('should execute cut command programmatically', async () => {
      const editor = iframeHook.editor();
      editor.setContent('<p>Cut command test</p>');
      TinySelections.setSelection(editor, [ 0, 0 ], 4, [ 0, 0 ], 11);

      editor.execCommand('Cut');

      if (isChromium) {
        await Waiter.pTryUntil('content cut via command', () => {
          const content = editor.getContent();
          return content === '<p>Cut test</p>';
        });

        TinySelections.setCursor(editor, [ 0, 0 ], 4);
        await RealClipboard.pPaste('iframe => body');

        await Waiter.pTryUntil('content pasted after cut', () => {
          const content = editor.getContent();
          return content === '<p>Cut command test</p>';
        });
      } else if (isBrowserWithPasteRestrictions) {
        await assertNotification(editor, 'Your browser restricts clipboard access. Please use keyboard shortcut', 'info');
      }
    });

    it('should execute paste command programmatically', async () => {
      const editor = iframeHook.editor();

      editor.setContent('<p>Content to copy</p>');
      TinySelections.select(editor, 'p', [ 0 ]);
      await RealMouse.pClickOn('button[aria-label="Copy"]');

      editor.setContent('<p>Target for paste:</p>');
      TinySelections.setCursor(editor, [ 0, 0 ], 17);
      editor.execCommand('Paste');

      if (isChromium) {
        await Waiter.pTryUntil('content pasted via command', () => {
          const content = editor.getContent();
          return content.indexOf('Target for paste:Content to copy') !== -1;
        });
      } else if (isBrowserWithPasteRestrictions) {
        await assertNotification(editor, 'Your browser restricts clipboard access. Please use keyboard shortcut', 'info');
      }
    });
  });

  // TODO: This test is failing because the clipboard permissions are not set correctly.
  describe('Clipboard events', () => {
    it('should fire clipboard events when using commands', async () => {
      const editor = iframeHook.editor();
      editor.setContent('<p>Event test content</p>');
      TinySelections.setSelection(editor, [ 0, 0 ], 6, [ 0, 0 ], 10);

      let copyEventFired = false;
      const copyHandler = () => {
        copyEventFired = true;
      };
      editor.on('copy', copyHandler);
      editor.execCommand('Copy');
      await ClipboardUtils.pTriggerCopyEvent(editor, { startPath: [ 0, 0 ], soffset: 6, finishPath: [ 0, 0 ], foffset: 10 });
      editor.off('copy', copyHandler);
      assert.isTrue(copyEventFired, 'Copy event should have fired');

      let cutEventFired = false;
      const cutHandler = () => {
        cutEventFired = true;
      };
      editor.on('cut', cutHandler);
      editor.execCommand('Cut');
      await ClipboardUtils.pTriggerCutEvent(editor, { startPath: [ 0, 0 ], soffset: 6, finishPath: [ 0, 0 ], foffset: 10 });
      editor.off('cut', cutHandler);
      assert.isTrue(cutEventFired, 'Cut event should have fired');

      let pasteEventFired = false;
      const pasteHandler = () => {
        pasteEventFired = true;
      };
      editor.on('paste', pasteHandler);
      editor.execCommand('Paste');
      await ClipboardUtils.pTriggerPasteEvent(editor, { startPath: [ 0, 0 ], soffset: 17, finishPath: [ 0, 0 ], foffset: 21 });
      editor.off('paste', pasteHandler);
      assert.isTrue(pasteEventFired, 'Paste event should have fired');
    });

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

      TinySelections.setCursor(editor, [ 0, 0 ], 7);
      await RealClipboard.pCopy('iframe => body');
      editor.execCommand('Paste');

      editor.off('PastePreProcess');
      editor.off('PastePostProcess');

      assert.isTrue(preProcessFired, 'PastePreProcess event should have fired');
      assert.isTrue(processFired, 'PastePostProcess event should have fired');
    });
  });
});
