import { UiFinder } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { TinyDom, TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.themes.silver.editor.core.ContentLanguageHiddenTest', () => {
  const hook = TinyHooks.bddSetup<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    toolbar: 'language | bold italic'
  }, []);

  it('TINY-7570: Does not show the toolbar button if content_langs is not defined', () => {
    const editor = hook.editor();
    UiFinder.notExists(TinyDom.container(editor), 'button[title="Language"]');
  });

  it('TINY-7570: Does not show menu item if content_langs is not defined', async () => {
    const editor = hook.editor();
    TinyUiActions.clickOnMenu(editor, 'button:contains("Format")');
    await TinyUiActions.pWaitForUi(editor, '[role="menu"]');
    UiFinder.notExists(TinyDom.container(editor), '[role="menu"] [title="Language"]');
    // close it again
    TinyUiActions.clickOnMenu(editor, 'button:contains("Format")');
  });
});
