import { Waiter } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { PlatformDetection } from '@ephox/sand';
import { TinyContentActions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import type Editor from 'tinymce/core/api/Editor';
import { announcerContainerId } from 'tinymce/core/aria/AriaAnnouncer';

describe('browser.tinymce.core.AriaAnnounceFormatToggleTest', () => {
  const hook = TinyHooks.bddSetup<Editor>({
    base_url: '/project/tinymce/js/tinymce'
  }, []);

  const platform = PlatformDetection.detect();

  const getAnnouncerContainer = (): HTMLElement => {
    const container = document.body.querySelector(`#${announcerContainerId}`);
    assert.isNotNull(container, 'aria announcer container should exist on the body');
    return container as HTMLElement;
  };

  const pAssertAnnouncement = (expected: string): Promise<void> =>
    Waiter.pTryUntil(`Announcement token for "${expected}" should exist`, () => {
      const token = getAnnouncerContainer().querySelector(`span[aria-label="${expected}"]`);
      assert.isNotNull(token, `aria token with label "${expected}" should exist`);
    });

  const pWaitForTokenRemoval = (message: string): Promise<void> =>
    Waiter.pTryUntil(`Announcement token for "${message}" should be removed`, () => {
      const token = getAnnouncerContainer().querySelector(`span[aria-label="${message}"]`);
      assert.isNull(token, `aria token with label "${message}" should have been removed`);
    }, 100, 2000);

  const keystroke = (editor: Editor, key: string) => {
    TinyContentActions.keystroke(editor, key.charCodeAt(0), platform.os.isMacOS() ? { meta: true } : { ctrl: true });
  };

  const setupEditor = (editor: Editor) => {
    editor.setContent('<p>abc</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 3);
  };

  it('TINY-ARIA: Ctrl+B announces "Bold on" then "Bold off"', async () => {
    const editor = hook.editor();
    setupEditor(editor);

    keystroke(editor, 'B');
    await pAssertAnnouncement('Bold on');
    await pWaitForTokenRemoval('Bold on');

    keystroke(editor, 'B');
    await pAssertAnnouncement('Bold off');
  });

  it('TINY-ARIA: Ctrl+I announces "Italic on" then "Italic off"', async () => {
    const editor = hook.editor();
    setupEditor(editor);

    keystroke(editor, 'I');
    await pAssertAnnouncement('Italic on');
    await pWaitForTokenRemoval('Italic on');

    keystroke(editor, 'I');
    await pAssertAnnouncement('Italic off');
  });

  it('TINY-ARIA: execCommand Bold announces "Bold on" then "Bold off"', async () => {
    const editor = hook.editor();
    setupEditor(editor);

    editor.execCommand('Bold');
    await pAssertAnnouncement('Bold on');
    await pWaitForTokenRemoval('Bold on');

    editor.execCommand('Bold');
    await pAssertAnnouncement('Bold off');
  });

  it('TINY-ARIA: execCommand Strikethrough announces correctly', async () => {
    const editor = hook.editor();
    setupEditor(editor);

    editor.execCommand('Strikethrough');
    await pAssertAnnouncement('Strikethrough on');
    await pWaitForTokenRemoval('Strikethrough on');

    editor.execCommand('Strikethrough');
    await pAssertAnnouncement('Strikethrough off');
  });

  it('TINY-ARIA: mceToggleFormat for Bold announces correctly', async () => {
    const editor = hook.editor();
    setupEditor(editor);

    editor.execCommand('mceToggleFormat', false, 'bold');
    await pAssertAnnouncement('Bold on');
    await pWaitForTokenRemoval('Bold on');

    editor.execCommand('mceToggleFormat', false, 'bold');
    await pAssertAnnouncement('Bold off');
  });
});
