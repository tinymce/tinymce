import { Mouse, UiFinder } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { SugarBody } from '@ephox/sugar';
import { TinyDom, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/image/Plugin';

describe('browser.tinymce.plugins.lists.ContextMenuTest', () => {
  const hook = TinyHooks.bddSetup<Editor>({
    plugins: 'lists',
    toolbar: 'numlist bullist',
    base_url: '/project/tinymce/js/tinymce',
    contextmenu: 'lists'
  }, [ Plugin ], true);

  it('TINY-10490: open contextmenu directly on a li of a ol should have `List properties...` enabled', async () => {
    const editor = hook.editor();
    editor.setContent(`
      <ul>
        <li>ul</li>
      </ul>
      <ol>
        <li>ol</li>
      </ol>`
    );
    /*
      We have to manually set the selection, which is fine, but in this test case, it does not test anything.
      The origin of this bug was a issue in firefox that was causing not setting up the selection right.
    */
    TinySelections.setCursor(editor, [ 1, 0 ], 0);
    Mouse.contextMenuOn(TinyDom.body(editor), 'ol > li');
    UiFinder.exists(SugarBody.body(), '[aria-label="List properties..."][aria-disabled="false"]');
  });
});
