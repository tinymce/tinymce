import { UiFinder } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { Fun } from '@ephox/katamari';
import { TinyAssertions, TinyHooks, TinySelections } from '@ephox/mcagar';
import { SugarBody } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.themes.silver.throbber.ThrobberEditorTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
  }, [ Theme ]);

  const pToggleThrobber = async (editor: Editor, action: () => void = Fun.noop) => {
    editor.setProgressState(true);
    await UiFinder.pWaitForVisible('Wait for throbber to show', SugarBody.body(), '.tox-throbber');
    action();
    editor.setProgressState(false);
    await UiFinder.pWaitForHidden('Wait for throbber to hide', SugarBody.body(), '.tox-throbber');
  };

  it('TINY-7373: should not change the editor selection', async () => {
    const editor = hook.editor();
    editor.setContent('<p>abc</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 2);
    await pToggleThrobber(editor);
    TinyAssertions.assertSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 2);
  });

  context('Commands', () => {
    it('TINY-7373: should be able to use format commands when throbber is enabled', async () => {
      const editor = hook.editor();
      editor.setContent('<p>abc</p>');
      TinySelections.setCursor(editor, [ 0, 0 ], 1);
      await pToggleThrobber(editor, () => editor.execCommand('Bold'));
      TinyAssertions.assertContent(editor, '<p><strong>abc</strong></p>');
    });
  });

  context('Editor APIs', () => {
    it('TINY-7373: should be able to use insertContent when throbber is enabled', async () => {
      const editor = hook.editor();
      editor.setContent('<p>abc</p>');
      TinySelections.setCursor(editor, [ 0, 0 ], 1);
      await pToggleThrobber(editor, () => editor.insertContent('d'));
      TinyAssertions.assertContent(editor, '<p>adbc</p>');
    });

    it('TINY-7373: should be able to change selection when throbber is enabled', async () => {
      const editor = hook.editor();
      editor.setContent('<p>abc</p>');
      TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 0);
      await pToggleThrobber(editor, () => TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 2));
      TinyAssertions.assertSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 2);
    });
  });
});
