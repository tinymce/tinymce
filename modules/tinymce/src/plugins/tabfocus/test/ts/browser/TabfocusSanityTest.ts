import { Keyboard, Keys, Waiter } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { TinyDom, TinyHooks } from '@ephox/mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/tabfocus/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.plugins.tabfocus.TabfocusSanityTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'tabfocus',
    tabfocus_elements: 'tempinput1',
    base_url: '/project/tinymce/js/tinymce'
  }, [ Theme, Plugin ], true);

  const addInputs = (editor: Editor) => {
    const container = editor.getContainer();
    const input1 = document.createElement('input');
    input1.id = 'tempinput1';
    container.parentNode.insertBefore(input1, container);
  };

  const removeInputs = () => {
    const input1 = document.getElementById('tempinput1');
    input1.parentNode.removeChild(input1);
  };

  it('TBA: Add an input field outside the editor, focus on the editor, press the tab key and assert focus shifts to the input field', async () => {
    const editor = hook.editor();
    addInputs(editor);
    assert.equal(document.activeElement.nodeName, 'IFRAME');
    Keyboard.activeKeystroke(TinyDom.document(editor), Keys.tab());
    await Waiter.pTryUntil('Wait for focus', () => {
      const input = document.getElementById('tempinput1');
      assert.equal(document.activeElement.outerHTML, input.outerHTML);
    });
    removeInputs();
  });
});
