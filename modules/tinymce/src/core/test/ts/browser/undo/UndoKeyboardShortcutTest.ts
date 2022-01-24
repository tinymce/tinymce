import { RealKeys } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { TinyAssertions } from '@ephox/mcagar';
import { PlatformDetection } from '@ephox/sand';
import { TinyHooks } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.core.undo.UndoKeyboardShortcutTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce'
  }, [], true);
  const platform = PlatformDetection.detect();

  const SelectAll = async () => {
    await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.combo(platform.os.isMacOS ? { metaKey: true } : { ctrlKey: true }, 'a') ]);
  };
  const Undo = async () => {
    await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.combo(platform.os.isMacOS ? { metaKey: true } : { ctrlKey: true }, 'z') ]);
  };
  const Redo = async () => {
    await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.combo(platform.os.isMacOS ? { metaKey: true } : { ctrlKey: true }, 'y') ]);
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
    await SelectAll();
    await Delete(editor);
    TinyAssertions.assertContent(editor, '');
    await Undo();
    TinyAssertions.assertContent(editor, '<p>abc</p>');
    await Redo();
    TinyAssertions.assertContent(editor, '');
  });
});
