import { describe, it, before, afterEach, after } from '@ephox/bedrock-client';
import { Insert, Remove, Selectors, SugarBody, SugarElement } from '@ephox/sugar';
import { assert } from 'chai';

import 'tinymce';
import Editor from 'tinymce/core/api/Editor';
import EditorManager from 'tinymce/core/api/EditorManager';

describe('browser.tinymce.core.EditorAutoFocusTest', () => {
  const isInViewport = (editor: Editor) => {
    const containerRect = editor.getContentAreaContainer().getBoundingClientRect();
    const innerRect = editor.selection.getNode().getBoundingClientRect();
    const top = containerRect.top + innerRect.top + 1;
    return top > 0 && top + innerRect.height < window.innerHeight;
  };

  const pSetupEditorAutoFocus = (id: string) => {
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

  const pTestEditorAutoFocus = async (id: string) => {
    await pSetupEditorAutoFocus(id);
    const editor = EditorManager.get(id);
    assert.isTrue(editor.hasFocus());
    assert.isTrue(isInViewport(editor));
  };

  before(() => {
    Insert.append(SugarBody.body(), SugarElement.fromHtml(`<div id="abc">
    <textarea id="mce_0">Editor_0</textarea>
    <textarea id="mce_1">Editor_1</textarea>
    <textarea id="mce_2">Editor_2</textarea>
  </div>`));
  });

  after(() => {
    Selectors.one('#abc').each(Remove.remove);
  });

  afterEach(() => {
    EditorManager.remove();
  });

  it('TINY-8785: should autofocus the first editor', async () => {
    await pTestEditorAutoFocus('mce_0');
  });

  it('TINY-8785: should autofocus the second editor', async () => {
    await pTestEditorAutoFocus('mce_1');
  });

  it('TINY-8785: should autofocus the third editor', async () => {
    await pTestEditorAutoFocus('mce_2');
  });
});
