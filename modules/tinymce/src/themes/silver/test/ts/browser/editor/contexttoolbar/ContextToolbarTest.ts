import { TestStore, UiFinder, Waiter } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { SugarBody } from '@ephox/sugar';
import { TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.themes.silver.editor.contexttoolbar.ContextToolbarTest', () => {
  const store = TestStore();
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    setup: (ed: Editor) => {
      ed.ui.registry.addButton('alpha', {
        text: 'Alpha',
        onAction: store.adder('alpha-exec')
      });
      ed.ui.registry.addContextToolbar('test-toolbar', {
        predicate: (node) => node.nodeName.toLowerCase() === 'a',
        items: 'alpha'
      });
    }
  }, []);

  it('TBA: Moving selection away from the context toolbar predicate should make it disappear', async () => {
    const editor = hook.editor();
    editor.setContent('<p>One <a href="http://tiny.cloud">link</a> Two</p>');
    // Need to wait a little before checking the context toolbar isn't shown,
    // since we don't have anything we can wait for a change in
    await Waiter.pWait(100);
    UiFinder.notExists(SugarBody.body(), '.tox-pop');
    TinySelections.setCursor(editor, [ 0, 1, 0 ], 'L'.length);
    editor.focus();
    await UiFinder.pWaitForVisible('Waiting for toolbar', SugarBody.body(), '.tox-pop');
    // NOTE: This internally fires a nodeChange
    TinySelections.setCursor(editor, [ 0, 0 ], 'O'.length);
    await Waiter.pTryUntil(
      'Wait for dialog to disappear after nodeChange',
      () => UiFinder.notExists(SugarBody.body(), '.tox-pop')
    );
  });
});
