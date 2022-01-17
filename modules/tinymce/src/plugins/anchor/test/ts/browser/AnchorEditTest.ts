import { describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks, TinySelections, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/anchor/Plugin';

import { pAddAnchor, pAssertAnchorPresence } from '../module/Helpers';

describe('browser.tinymce.plugins.anchor.AnchorEditTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'anchor',
    toolbar: 'anchor',
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin ], true);

  it('TBA: Add anchor, change anchor, undo anchor change then the anchor should be there as first entered', async () => {
    const editor = hook.editor();
    editor.setContent('abc');
    await pAddAnchor(editor, 'abc', true);
    await pAssertAnchorPresence(editor, 1, 'a.mce-item-anchor#abc');
    TinySelections.select(editor, 'a.mce-item-anchor', []);
    await TinyUiActions.pWaitForUi(editor, 'button[aria-label="Anchor"][aria-pressed="true"]');
    await pAddAnchor(editor, 'def', true);
    await pAssertAnchorPresence(editor, 1, 'a.mce-item-anchor#def');
    editor.execCommand('undo');
    TinySelections.setCursor(editor, [], 0);
    TinyAssertions.assertContentPresence(editor, { 'a.mce-item-anchor#abc': 1 });
    await TinyUiActions.pWaitForUi(editor, 'button[aria-label="Anchor"][aria-pressed="false"]');
  });
});
