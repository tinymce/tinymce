import { describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks, TinySelections, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/lists/Plugin';

describe('browser.tinymce.plugins.lists.ToggleListWithEmptyLiTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    indent: false,
    plugins: 'lists',
    toolbar: 'bullist',
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin ], true);

  it('TBA: toggle bullet list on list with two empty LIs', async () => {
    const editor = hook.editor();
    editor.setContent('<ul><li>a</li><li>&nbsp;</li><li>&nbsp;</li><li>b</li></ul>');
    TinySelections.setSelection(editor, [ 0, 0, 0 ], 0, [ 0, 3, 0 ], 1);
    // Wait for toolbar button to be active
    await TinyUiActions.pWaitForUi(editor, 'button[aria-label="Bullet list"].tox-tbtn--enabled');
    TinyUiActions.clickOnToolbar(editor, 'button[aria-label="Bullet list"]');
    TinyAssertions.assertContent(editor, '<p>a</p><p>&nbsp;</p><p>&nbsp;</p><p>b</p>');
  });
});
