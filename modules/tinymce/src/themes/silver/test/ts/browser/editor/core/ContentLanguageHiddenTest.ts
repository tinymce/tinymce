import { describe, it } from '@ephox/bedrock-client';
import { TinyHooks, TinyUiActions } from '@ephox/mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.themes.silver.editor.core.ContentLanguageHiddenTest', () => {
  const hook = TinyHooks.bddSetup<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    toolbar: 'language | bold italic'
  }, [ Theme ]);

  it('TINY-7570: Does not show the toolbar button if content_langs is not defined', () => {
    const editor = hook.editor();
    assert.throws(() => TinyUiActions.clickOnToolbar(editor, '[title="Language"]'));
  });

  it('TINY-7570: Does not show menu item if content_langs is not defined', async () => {
    const editor = hook.editor();
    TinyUiActions.clickOnMenu(editor, 'button:contains("Format")');
    await TinyUiActions.pWaitForUi(editor, '[role="menu"]');
    assert.throws(() => TinyUiActions.clickOnUi(editor, '[role="menu"] [title="Language"]'));
    // close it again
    TinyUiActions.clickOnMenu(editor, 'button:contains("Format")');
  });
});
