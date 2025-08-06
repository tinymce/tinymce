import { Waiter, Keys } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyContentActions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import AutoLinkPlugin from 'tinymce/plugins/autolink/Plugin';

describe('browser.tinymce.plugins.autolink.ReadOnlyModeAutoLinkTest', () => {
  const hook = TinyHooks.bddSetup<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    toolbar: 'bold',
    plugins: 'autolink',
    indent: false,
    statusbar: false,
  }, [ AutoLinkPlugin ], true);

  const setMode = (editor: Editor, mode: string) => {
    editor.mode.set(mode);
  };

  it('TINY-10981: Coverting paragraph to link with autolink should not be permitted in readonly mode', async () => {
    const editor = hook.editor();
    editor.setContent(`<p>https://google.com</p>`);

    setMode(editor, 'readonly');
    TinySelections.setCursor(editor, [ 0, 0 ], 'https://google.com'.length);
    TinyContentActions.keystroke(editor, Keys.enter());
    await Waiter.pTryUntil('Wait for content to change', () => TinyAssertions.assertContent(editor, '<p>https://google.com</p>'));

    setMode(editor, 'design');
    TinySelections.setCursor(editor, [ 0, 0 ], 'https://google.com'.length);
    TinyContentActions.keystroke(editor, Keys.enter());
    await Waiter.pTryUntil('Wait for content to change', () => TinyAssertions.assertContent(editor, '<p><a href="https://google.com">https://google.com</a></p><p>&nbsp;</p>'));
  });
});
