import { TestStore, Waiter } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { TinyHooks } from '@ephox/wrap-mcagar';

import type Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.themes.silver.view.ViewShowOptionTest', () => {
  context('Initialize view with show option', () => {
    const store = TestStore();
    const hook = TinyHooks.bddSetupLight<Editor>({
      base_url: '/project/tinymce/js/tinymce',
      view_show: 'myview1',
      setup: (editor: Editor) => {
        editor.ui.registry.addView('myview1', {
          onShow: store.adder('myview1:show'),
          onHide: store.adder('myview1:hide')
        });
      }
    });

    it('TINY-13463: Toggle view command on init event test', async () => {
      const editor = hook.editor();
      await Waiter.pTryUntil('Checking view callbacks on init', () => store.assertEq('Asserting view callbacks', [
        'myview1:show',
      ]));
      editor.execCommand('ToggleView', false, 'myview1');
      await Waiter.pTryUntil('Checking view callbacks after closing view', () => store.assertEq('Asserting view callbacks', [
        'myview1:show',
        'myview1:hide',
      ]));
    });
  });
});
