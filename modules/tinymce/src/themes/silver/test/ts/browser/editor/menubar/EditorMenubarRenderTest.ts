import { describe, it } from '@ephox/bedrock-client';
import { Css } from '@ephox/sugar';
import { TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import { tinymce } from 'tinymce/core/api/Tinymce';

describe('browser.tinymce.themes.silver.editor.menubar.EditorMenubarRenderTest', () => {
  const hook = TinyHooks.bddSetup<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    setup: (editor: Editor) => {
      editor.on('ScriptsLoaded', () => {
        const orgLoad = editor.ui.styleSheetLoader.load;
        editor.ui.styleSheetLoader.load = (url) => {
          return new Promise((resolve) => {
            setTimeout(() => {
              return orgLoad(url).then(resolve);
            }, 100);
          });
        };
      });
    }
  }, []);

  tinymce.addI18n('en', {
    File: 'File foo'
  });

  it('TINY-10343: editor menu button with more that one word should not render the word one above the other', async () => {
    const editor = hook.editor();

    const menuButton = await TinyUiActions.pWaitForUi(editor, 'button:contains("File foo")');
    // when the width is `59.7109px` the words are rendered one above the other
    // when the width is `63.8672px` the words are rendered on the same line
    assert.isAtLeast(parseFloat(Css.get(menuButton, 'width')), 61);
  });
});
