import { FocusTools, Keys } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { SugarDocument } from '@ephox/sugar';
import { TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/link/Plugin';

describe('browser.tinymce.plugins.link.LinkContextMenuTest', () => {
  const hook = TinyHooks.bddSetup<Editor>({
    plugins: 'link',
    toolbar: 'link',
    base_url: '/project/tinymce/js/tinymce',
  }, [ Plugin ]);

  const pAssertFocusOnItem = (label: string, selector: string) =>
    FocusTools.pTryOnSelector(`Focus should be on: ${label}`, SugarDocument.getDocument(), selector);

  const pressDownArrowKey = (editor: Editor) => TinyUiActions.keydown(editor, Keys.down());

  it('TINY-2293: Context menu shows up on links', async () => {
    const editor = hook.editor();
    editor.setContent('<p><a href="http://tiny.cloud">tiny</a></p>');
    await TinyUiActions.pTriggerContextMenu(editor, 'a[href="http://tiny.cloud"]', '.tox-silver-sink [role="menuitem"]');
    await pAssertFocusOnItem('Link...', '.tox-collection__item:contains("Link...")');
    pressDownArrowKey(editor);
    await pAssertFocusOnItem('Remove link', '.tox-collection__item:contains("Remove link")');
    pressDownArrowKey(editor);
    await pAssertFocusOnItem('Open link', '.tox-collection__item:contains("Open link")');
  });
});
