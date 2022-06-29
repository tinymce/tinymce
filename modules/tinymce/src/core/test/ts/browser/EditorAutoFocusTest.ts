import { describe, it, before, afterEach } from '@ephox/bedrock-client';
import { Insert, SugarBody, SugarElement } from '@ephox/sugar';
import { TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import { EditorManager } from 'tinymce/core/api/PublicApi';

const isInViewport = (editor: Editor) => {
  const containerRect = editor.getContentAreaContainer().getBoundingClientRect();
  const innerRect = editor.selection.getNode().getBoundingClientRect();
  const top = containerRect.top + innerRect.top + 1;
  return top > 0 && top + innerRect.height < window.innerHeight;
};

const setupEditorAutoFocus = (id: string) => {
  return new Promise((resolve) => {
    EditorManager.init({
      selector: 'textarea',
      base_url: '/project/tinymce/js/tinymce/',
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
  await setupEditorAutoFocus(id);
  const editor = EditorManager.get(id);
  assert.isTrue(editor.hasFocus());
  assert.isTrue(isInViewport(editor));
};

describe('browser.tinymce.core.EditorAutoFocusTest', () => {
  before(() => {
    Insert.append(SugarBody.body(), SugarElement.fromHtml(`<div>
    <textarea id="mce_0">Editor_0</textarea>
    <textarea id="mce_1">Editor_1</textarea>
    <textarea id="mce_2">Editor_2</textarea>
  </div>`));
    TinyHooks.bddSetupLight({}); // it puts tinymce to global scope as a side effect
  });

  afterEach(() => EditorManager.remove());

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
