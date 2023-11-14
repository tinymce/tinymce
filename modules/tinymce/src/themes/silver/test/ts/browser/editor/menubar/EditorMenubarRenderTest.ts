import { describe, it } from '@ephox/bedrock-client';
import { Css } from '@ephox/sugar';
import { TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';

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
    },
    menubar: 'menutest file',
    menu: {
      menutest: { title: 'File foo', items: 'cut' }
    },
  }, []);

  it('TINY-10343: editor menu button with more that one word should not render the word one above the other', async () => {
    const editor = hook.editor();

    const menuButtonText = await TinyUiActions.pWaitForUi(editor, 'button:contains("File foo") span');

    const delta = 6;
    // Status at the moment of writting of this test:
    // when the height is `32px` the words are rendered one above the other
    // when the height is `16px` the words are rendered on the same line
    // font-size is 14px so I added a delta for the test
    assert.isBelow(parseFloat(Css.get(menuButtonText, 'height')), parseInt(Css.get(menuButtonText, 'font-size'), 10) + delta);
  });
});
