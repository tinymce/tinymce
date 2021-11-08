import { describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks, TinySelections, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/lists/Plugin';

describe('browser.tinymce.plugins.lists.ApplyListOnParagraphWithStylesTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    indent: false,
    plugins: 'lists',
    toolbar: 'numlist bullist',
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin ]);

  it('TBA: remove margin from p when applying list on it, but leave other styles', () => {
    const editor = hook.editor();
    editor.setContent('<p style="color: blue;margin: 30px;margin-right: 30px;margin-bottom: 30px;margin-left: 30px;margin-top: 30px;">test</p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 0);
    TinyUiActions.clickOnToolbar(editor, 'button[aria-label="Bullet list"]');
    TinyAssertions.assertContent(editor, '<ul><li style="color: blue;">test</li></ul>');
  });

  it('TBA: remove padding from p when applying list on it, but leave other styles', () => {
    const editor = hook.editor();
    editor.setContent('<p style="color: red;padding: 30px;padding-right: 30px;padding-bottom: 30px;padding-left: 30px;padding-top: 30px;">test</p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 0);
    TinyUiActions.clickOnToolbar(editor, 'button[aria-label="Bullet list"]');
    TinyAssertions.assertContent(editor, '<ul><li style="color: red;">test</li></ul>');
  });
});
