import { describe, it } from '@ephox/bedrock-client';
import { TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/link/Plugin';

describe('browser.tinymce.core.content.ContextMenuTest', () => {
  const hook = TinyHooks.bddSetup<Editor>({
    plugins: 'link',
    toolbar: 'link',
    base_url: '/project/tinymce/js/tinymce',
  }, [ Plugin ]);

  it('TBA: Context menu show up on link', async () => {
    const editor = hook.editor();
    editor.setContent('<p><a href="http://tiny.cloud">tiny</a></p>');
    await TinyUiActions.pTriggerContextMenu(editor, 'a[href="http://tiny.cloud"]', '.tox-silver-sink [role="menuitem"]');
    await TinyUiActions.pWaitForUi(editor, '[title="Link..."]');
    await TinyUiActions.pWaitForUi(editor, '[title="Remove link"]');
    await TinyUiActions.pWaitForUi(editor, '[title="Open link"]');
  });
});
