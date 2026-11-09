import { Mouse } from '@ephox/agar';
import { beforeEach, describe, it } from '@ephox/bedrock-client';
import { Attribute } from '@ephox/sugar';
import { TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import type Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.themes.silver.editor.buttons.ToolbarToggleButtonDoubleClickTest', () => {
  const events: string[] = [];

  const hook = TinyHooks.bddSetupLight<Editor>({
    toolbar: 'dbl-toggle',
    base_url: '/project/tinymce/js/tinymce',
    setup: (editor: Editor) => {
      editor.ui.registry.addToggleButton('dbl-toggle', {
        text: 'Double',
        onAction: () => {
          events.push('onAction');
        },
        onDoubleClick: (api) => {
          events.push('onDoubleClick');
          api.setActive(!api.isActive());
          events.push('isActive:' + api.isActive());
        }
      });
    }
  }, []);

  const selector = '.tox-tbtn:contains("Double")';

  beforeEach(() => {
    events.length = 0;
  });

  it('TINYMCE-15104: double clicking a toggle button calls onDoubleClick with the instance api', async () => {
    const editor = hook.editor();
    const button = await TinyUiActions.pWaitForUi(editor, selector);

    Mouse.click(button);
    Mouse.click(button);
    Mouse.dblclick(button);

    assert.deepEqual(events, [ 'onAction', 'onAction', 'onDoubleClick', 'isActive:true' ]);
    assert.equal(Attribute.get(button, 'aria-pressed'), 'true', 'api.setActive from onDoubleClick should update the button');
  });

  it('TINYMCE-15104: double clicking a disabled toggle button does not call onDoubleClick', async () => {
    const editor = hook.editor();
    const button = await TinyUiActions.pWaitForUi(editor, selector);
    editor.mode.set('readonly');
    try {
      assert.equal(Attribute.get(button, 'aria-disabled'), 'true', 'Button should be disabled in readonly mode');
      Mouse.dblclick(button);
      assert.deepEqual(events, [], 'onDoubleClick should not run in readonly mode');
    } finally {
      editor.mode.set('design');
    }
  });
});
