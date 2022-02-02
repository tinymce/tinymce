import { describe, it } from '@ephox/bedrock-client';
import { TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.core.init.EditorCustomThemeTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    add_unload_trigger: false,
    disable_nodechange: true,
    automatic_uploads: false,
    entities: 'raw',
    indent: false,
    base_url: '/project/tinymce/js/tinymce',
    theme: (editor: Editor, targetnode: HTMLElement) => {
      const editorContainer = document.createElement('div');
      editorContainer.id = 'editorContainer';

      const iframeContainer = document.createElement('div');
      iframeContainer.id = 'iframeContainer';

      editorContainer.appendChild(iframeContainer);
      targetnode.parentNode.insertBefore(editorContainer, targetnode);

      if (editor.initialized) {
        editor.fire('SkinLoaded');
      } else {
        editor.on('init', () => {
          editor.fire('SkinLoaded');
        });
      }

      return {
        iframeContainer,
        editorContainer
      };
    }
  }, []);

  it('getContainer/getContentAreaContainer', () => {
    const editor = hook.editor();
    assert.equal(editor.getContainer().id, 'editorContainer', 'Should be the new editorContainer element');
    assert.equal(editor.getContainer().nodeType, 1, 'Should be an element');
    assert.equal(editor.getContentAreaContainer().id, 'iframeContainer', 'Should be the new iframeContainer element');
    assert.equal(editor.getContentAreaContainer().nodeType, 1, 'Should be an element');
  });
});
