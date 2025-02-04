import { FocusTools, Keys } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { SugarDocument } from '@ephox/sugar';
import { TinyContentActions, TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.themes.silver.editor.TabStoppingTest', () => {
  const hook = TinyHooks.bddSetup<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    width: 400,
    toolbar_mode: 'sliding',
    toolbar: 'bold italic | underline strikethrough fontsizeinput | alignleft aligncenter alignright alignjustify | align lineheight fontsize fontfamily blocks styles insertfile | styles | ' +
    'bullist numlist outdent indent | link image | print preview media | forecolor backcolor emoticons table codesample code language | ltr rtl'
  }, []);

  const focusToolbar = (editor: Editor) =>
    TinyContentActions.keydown(editor, 121, { altKey: true });
  const pressTab = (editor: Editor) =>
    TinyUiActions.keydown(editor, Keys.tab());
  const pAssertFocused = (name: string, selector: string) =>
    FocusTools.pTryOnSelector(name, SugarDocument.getDocument(), selector);

  it('TINY-11762: More-button does not trap the focus when in sliding mode', async () => {
    const editor = hook.editor();
    focusToolbar(editor);
    pressTab(editor);
    pressTab(editor);
    await pAssertFocused('More-button is focused', '.tox-tbtn[aria-label="Reveal or hide additional toolbar items"]');
    pressTab(editor);
    await pAssertFocused('Breadcrumb-element is focused', '.tox-statusbar__path-item');
  });
});
