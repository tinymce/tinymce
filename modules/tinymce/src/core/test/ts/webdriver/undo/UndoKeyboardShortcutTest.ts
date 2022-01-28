import { RealKeys } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { PlatformDetection } from '@ephox/sand';
import { TinyHooks, TinyAssertions, TinyContentActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

describe('webdriver.tinymce.core.undo.UndoKeyboardShortcutTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce'
  }, [], true);
  const platform = PlatformDetection.detect();

  // idk why but it works, seperate test command for macOS, Firefox, and the rest
  const SelectAll = async (editor: Editor) => {
    if (platform.os.isMacOS()) {
      await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.combo( { metaKey: true }, 'a') ]);
    } else if (!platform.browser.isFirefox()) {
      TinyContentActions.keystroke(editor, 'A'.charCodeAt(0), { ctrl: true });
    } else {
      await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.combo( { ctrlKey: true }, 'a') ]);
    }
  };
  const Undo = async (editor: Editor) => {
    if (platform.os.isMacOS()) {
      await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.combo( { metaKey: true }, 'z') ]);
    } else if (!platform.browser.isFirefox()) {
      TinyContentActions.keystroke(editor, 'Z'.charCodeAt(0), { ctrl: true });
    } else {
      await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.combo( { ctrlKey: true }, 'z') ]);
    }
  };
  const Redo = async (editor: Editor) => {
    if (platform.os.isMacOS()) {
      await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.combo({ metaKey: true }, 'y') ]);
    } else if (!platform.browser.isFirefox()) {
      TinyContentActions.keystroke(editor, 'Y'.charCodeAt(0), { ctrl: true });
    } else {
      await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.combo( { ctrlKey: true }, 'y') ]);
    }
  };
  const Delete = async (editor: Editor) => {
    // idk why safari need this but it works
    if (platform.browser.isSafari()) {
      editor.execCommand('Delete');
    } else {
      await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.backspace() ]);
    }
  };

  it('TINY-2884: shoud undo and redo action', async () => {
    const editor = hook.editor();
    editor.setContent('<p>abc</p>');
    await SelectAll(editor);
    await Delete(editor);
    TinyAssertions.assertContent(editor, '');
    await Undo(editor);
    TinyAssertions.assertContent(editor, '<p>abc</p>');
    await Redo(editor);
    TinyAssertions.assertContent(editor, '');
  });
});
