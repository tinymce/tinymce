import { UiFinder, Waiter } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { SugarBody } from '@ephox/sugar';
import { TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/image/Plugin';

describe('browser.tinymce.plugins.link.ContextMenuTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'lists',
    toolbar: 'numlist bullist',
    base_url: '/project/tinymce/js/tinymce',
    contextmenu: 'lists'
  }, [ Plugin ], true);

  const pOpenContextMenu = async (editor: Editor, target: string) => {
    // Not sure why this is needed, but without the browser deselects the contextmenu target
    await Waiter.pWait(0);
    await TinyUiActions.pTriggerContextMenu(editor, target, '.tox-silver-sink [role="menuitem"]');
  };

  it('TINY-10490: open contextmenu direclty on a li of a ol should have `List properties...` enabled', async () => {
    const editor = hook.editor();
    editor.setContent(
      '<ul><li>ul</li></ul><ol><li>ol</li></ol>'
    );
    await pOpenContextMenu(editor, 'ol > li');
    await Waiter.pWait(2000);
    UiFinder.exists(SugarBody.body(), '[title="List properties..."][aria-disabled="false"]');
  });
});
