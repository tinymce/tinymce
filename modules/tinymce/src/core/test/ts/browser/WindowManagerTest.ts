import { describe, it } from '@ephox/bedrock-client';
import { TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.core.WindowManagerTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    add_unload_trigger: false,
    disable_nodechange: true,
    indent: false,
    entities: 'raw',
    base_url: '/project/tinymce/js/tinymce'
  }, [ Theme ]);

  it('OpenWindow/CloseWindow events', () => {
    const editor = hook.editor();
    let openWindowArgs, closeWindowArgs;

    editor.on('CloseWindow', (e) => {
      closeWindowArgs = e;
    });

    editor.on('OpenWindow', (e) => {
      openWindowArgs = e;
      editor.windowManager.close();
    });

    editor.windowManager.open({
      title: 'Find and Replace',
      body: {
        type: 'panel',
        items: []
      },
      buttons: []
    });

    assert.equal(openWindowArgs.type, 'openwindow');
    assert.equal(closeWindowArgs.type, 'closewindow');

    editor.off('CloseWindow OpenWindow');
  });
});
