import { context, describe, it, before, afterEach, after } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { Insert, Remove, Selectors, SugarBody, SugarElement } from '@ephox/sugar';
import { assert } from 'chai';

import 'tinymce';
import Editor from 'tinymce/core/api/Editor';
import EditorManager from 'tinymce/core/api/EditorManager';

describe('browser.tinymce.core.EditorAutoFocusTest', () => {
  before(() => {
    Insert.append(SugarBody.body(), SugarElement.fromHtml(`<div id="abc">
      <div style="margin-top: 500px" class="tinymce" id="mce_0">Editor_0</div>
      <div style="margin-top: 500px" class="tinymce" id="mce_1">Editor_1</div>
      <div style="margin-top: 500px" class="tinymce" id="mce_2">Editor_2</div>
    </div>`));
  });

  after(() => {
    Selectors.one('#abc').each(Remove.remove);
  });

  afterEach(() => {
    EditorManager.remove();
  });

  const restOfWindowHeight = () =>
    window.innerHeight - SugarBody.body().dom.getBoundingClientRect().height;

  const isInViewport = (editor: Editor) => {
    const { top } = editor.getContainer().getBoundingClientRect();
    return top > 0 && top + 50 < window.innerHeight;
  };

  const pSetupEditorAutoFocus = (id: string, settings) => {
    const height = restOfWindowHeight();
    return new Promise((resolve) => {
      EditorManager.init({
        selector: 'div.tinymce',
        base_url: '/project/tinymce/js/tinymce/',
        menubar: false,
        statusbar: false,
        height,
        auto_focus: id,
        init_instance_callback: (editor: Editor) => {
          editor.on('focus', resolve);
        },
        ...settings
      });
    });
  };

  const pTestEditorAutoFocus = async (id: string, settings) => {
    await pSetupEditorAutoFocus(id, settings);
    const editor = EditorManager.get(id);
    assert.isTrue(editor.hasFocus());
    assert.isTrue(isInViewport(editor));
  };

  Arr.each([
    { label: 'Iframe Editor', settings: {}},
    { label: 'Inline Editor', settings: { inline: true }},
  ], (tester) => {
    context(tester.label, () => {
      it('TINY-8785: should autofocus the first editor and skip scrolling', async () => {
        await pTestEditorAutoFocus('mce_0', tester.settings);
        assert.equal(window.scrollY, 0);
      });

      it('TINY-8785: should autofocus the second editor', async () => {
        await pTestEditorAutoFocus('mce_1', tester.settings);
      });

      it('TINY-8785: should autofocus the third editor', async () => {
        await pTestEditorAutoFocus('mce_2', tester.settings);
      });
    });
  });
});
