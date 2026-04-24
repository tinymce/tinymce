import { UiFinder, Waiter } from '@ephox/agar';
import { afterEach, describe, it } from '@ephox/bedrock-client';
import { PlatformDetection } from '@ephox/sand';
import { SugarBody } from '@ephox/sugar';
import { TinyContentActions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import { announcerContainerId } from 'tinymce/core/api/dom/AriaAnnouncer';
import type Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.core.AriaAnnounceFormatToggleTest', () => {
  const hook = TinyHooks.bddSetup<Editor>({
    base_url: '/project/tinymce/js/tinymce'
  }, []);

  const platform = PlatformDetection.detect();

  const containerSelector = `#${announcerContainerId}`;

  const tokenSelector = (label: string): string =>
    `${containerSelector} span[aria-label="${label}"]`;

  afterEach(async () => {
    await Waiter.pTryUntil(
      'Announcer container should be cleaned up between tests',
      () => UiFinder.notExists(SugarBody.body(), containerSelector),
      100,
      3000
    );
  });

  const pAssertAnnouncement = (expected: string): Promise<void> =>
    UiFinder.pWaitFor(
      `Announcement token for "${expected}" should exist`,
      SugarBody.body(),
      tokenSelector(expected)
    ).then(() => undefined);

  const pWaitForTokenRemoval = (message: string): Promise<void> =>
    Waiter.pTryUntil(
      `Announcement token for "${message}" should be removed`,
      () => UiFinder.notExists(SugarBody.body(), tokenSelector(message)),
      100,
      2000
    );

  const keystroke = (editor: Editor, key: string) => {
    TinyContentActions.keystroke(editor, key.charCodeAt(0), platform.os.isMacOS() ? { meta: true } : { ctrl: true });
  };

  const setupEditor = (editor: Editor) => {
    editor.setContent('<p>abc</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 3);
  };

  it('TINY-12791: Ctrl+B announces "Bold on" then "Bold off"', async () => {
    const editor = hook.editor();
    setupEditor(editor);

    keystroke(editor, 'B');
    await pAssertAnnouncement('Bold on');
    await pWaitForTokenRemoval('Bold on');

    keystroke(editor, 'B');
    await pAssertAnnouncement('Bold off');
  });

  it('TINY-12791: Ctrl+I announces "Italic on" then "Italic off"', async () => {
    const editor = hook.editor();
    setupEditor(editor);

    keystroke(editor, 'I');
    await pAssertAnnouncement('Italic on');
    await pWaitForTokenRemoval('Italic on');

    keystroke(editor, 'I');
    await pAssertAnnouncement('Italic off');
  });

  it('TINY-12791: execCommand Bold announces "Bold on" then "Bold off"', async () => {
    const editor = hook.editor();
    setupEditor(editor);

    editor.execCommand('Bold');
    await pAssertAnnouncement('Bold on');
    await pWaitForTokenRemoval('Bold on');

    editor.execCommand('Bold');
    await pAssertAnnouncement('Bold off');
  });

  it('TINY-12791: execCommand Strikethrough announces correctly', async () => {
    const editor = hook.editor();
    setupEditor(editor);

    editor.execCommand('Strikethrough');
    await pAssertAnnouncement('Strikethrough on');
    await pWaitForTokenRemoval('Strikethrough on');

    editor.execCommand('Strikethrough');
    await pAssertAnnouncement('Strikethrough off');
  });

  it('TINY-12791: mceToggleFormat for Bold announces correctly', async () => {
    const editor = hook.editor();
    setupEditor(editor);

    editor.execCommand('mceToggleFormat', false, 'bold');
    await pAssertAnnouncement('Bold on');
    await pWaitForTokenRemoval('Bold on');

    editor.execCommand('mceToggleFormat', false, 'bold');
    await pAssertAnnouncement('Bold off');
  });
});
