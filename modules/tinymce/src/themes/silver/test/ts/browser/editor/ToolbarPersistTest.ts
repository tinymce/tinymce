import { UiFinder, Waiter } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { Focus, Insert, Remove, SugarBody, SugarElement } from '@ephox/sugar';
import { TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.themes.silver.editor.ToolbarPersistTest', () => {
  const hook = TinyHooks.bddSetup<Editor>({
    inline: true,
    base_url: '/project/tinymce/js/tinymce',
    toolbar_persist: true
  }, []);

  const unfocusEditor = () => {
    const div = SugarElement.fromTag('input');
    Insert.append(SugarBody.body(), div);
    Focus.focus(div);
    Remove.remove(div);
  };

  it('TINY-4847: With toolbar_persist focus & unfocus should not affect toolbar visibility', async () => {
    const editor = hook.editor();
    await TinyUiActions.pWaitForPopup(editor, '.tox-tinymce-inline');
    unfocusEditor();
    await Waiter.pWait(200); // Need to wait since nothing should happen.
    await TinyUiActions.pWaitForPopup(editor, '.tox-tinymce-inline');

    editor.ui.hide();

    await UiFinder.pWaitForHidden('Wait for editor to be hidden', SugarBody.body(), '.tox-tinymce-inline');
    editor.focus();
    editor.nodeChanged();
    await Waiter.pWait(200); // Need to wait since nothing should happen.
    await UiFinder.pWaitForHidden('Wait for editor to be hidden', SugarBody.body(), '.tox-tinymce-inline');

    editor.ui.show();
    await TinyUiActions.pWaitForPopup(editor, '.tox-tinymce-inline');
  });
});
