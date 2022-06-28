import { describe, it, before, afterEach } from '@ephox/bedrock-client';
import { Global } from '@ephox/katamari';
import { Insert, SugarBody, SugarElement } from '@ephox/sugar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import { ScriptLoader } from 'tinymce/core/api/PublicApi';

const isInViewport = (editor: Editor) => {
  const containerRect = editor.getContentAreaContainer().getBoundingClientRect();
  const innerRect = editor.selection.getNode().getBoundingClientRect();
  const top = containerRect.top + innerRect.top + 1;
  return top > 0 && top + innerRect.height < window.innerHeight;
};

before(() => {
  Insert.append(SugarBody.body(), SugarElement.fromHtml(`<div>
    <textarea id="mce_0">Editor_0</textarea>
    <textarea id="mce_1">Editor_1</textarea>
    <textarea id="mce_2">Editor_2</textarea>
  </div>`));
  const scriptLoader = new ScriptLoader();
  // return scriptLoader.loadScript('http://localhost:3000/js/tinymce/tinymce.js');
  return scriptLoader.loadScript('/project/tinymce/js/tinymce/tinymce.js');
});

const setupAutoFocus = (id: string) => {
  return new Promise((resolve) => {
    Global.tinymce.init({
      selector: 'textarea',
      toolbar: '',
      menubar: false,
      statusbar: false,
      height: 1000,
      auto_focus: id,
      init_instance_callback: (editor: Editor) => {
        editor.on('focus', resolve);
      }
    });
  });
};

const testEditorAutoFocus = async (id: string) => {
  await setupAutoFocus(id);
  const editor = Global.tinymce.EditorManager.get(id);
  assert.isTrue(editor.hasFocus());
  assert.isTrue(isInViewport(editor));

};

afterEach(() => Global.tinymce.remove());

describe('browser.tinymce.core.EditorAutoFocusTest', () => {

  it('TINY-8785: it should autofocus the first editor', async () => {
    await testEditorAutoFocus('mce_0');
  });

  it('TINY-8785: it should autofocus the second editor', async () => {
    await testEditorAutoFocus('mce_1');
  });

  it('TINY-8785: it should autofocus the third editor', async () => {
    await testEditorAutoFocus('mce_2');
  });
});
