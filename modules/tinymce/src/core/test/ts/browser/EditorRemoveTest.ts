import { Waiter } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { McEditor } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import EditorManager from 'tinymce/core/api/EditorManager';

describe('browser.tinymce.core.EditorRemoveTest', () => {

  const settings = {
    base_url: '/project/tinymce/js/tinymce'
  };

  const assertTextareaDisplayStyle = (editor: Editor, expected: string) => {
    const textareaElement = editor.getElement();
    assert.equal(textareaElement.style.display, expected, 'element does not have the expected style');
  };

  const testRemoveStyles = (editor: Editor, expectedStyle: string) => {
    assertTextareaDisplayStyle(editor, 'none');
    editor.remove();
    assertTextareaDisplayStyle(editor, expectedStyle);
    EditorManager.init({ selector: '#tinymce' });
    assertTextareaDisplayStyle(editor, expectedStyle);
    McEditor.remove(editor);
  };

  it('remove editor without initializing it', () => {
    const editor = new Editor('editor', {}, EditorManager);
    editor.remove();
  });

  it('remove editor after stylesheets load', async () => {
    await McEditor.pFromHtml('<textarea></textarea>', {
      ...settings,
      setup: (editor: Editor) => {
        editor.on('PreInit', () => {
          // Hook the function called when stylesheets are loaded
          // so we can remove the editor right after starting to load them.
          const realLoadAll = editor.ui.styleSheetLoader.loadAll;
          editor.ui.styleSheetLoader.loadAll = (urls: string[]) => {
            const result = realLoadAll.call(editor.ui.styleSheetLoader, urls);
            editor.ui.styleSheetLoader.loadAll = realLoadAll;
            editor.remove();
            return result;
          };
        });
      }
    }).then(
      () => Promise.reject('Expected editor would not load completely'),
      (err) => {
        // As we have deliberately removed the editor during the loading process
        // we have to intercept the error that is thrown by McEditor.pFromHtml.
        if (err === McEditor.errorMessageEditorRemoved) {
          return Promise.resolve();
        } else {
          return Promise.reject(err);
        }
      }
    );
    // allow the stylesheet loading to finish
    await Waiter.pWait(50);
  });

  it('remove editor where the body has been removed', async () => {
    const editor = await McEditor.pFromHtml<Editor>('<textarea></textarea>', settings);
    const body = editor.getBody();
    body.parentNode?.removeChild(body);
    McEditor.remove(editor);
  });

  it('init editor with no display style', async () => {
    const editor = await McEditor.pFromHtml<Editor>('<textarea id="tinymce"></textarea>', settings);
    testRemoveStyles(editor, '');
  });

  it('init editor with display: none', async () => {
    const editor = await McEditor.pFromHtml<Editor>('<textarea id="tinymce" style="display: none;"></textarea>', settings);
    testRemoveStyles(editor, 'none');
  });

  it('init editor with display: block', async () => {
    const editor = await McEditor.pFromHtml<Editor>('<textarea id="tinymce" style="display: block;"></textarea>', settings);
    testRemoveStyles(editor, 'block');
  });

  it('TINY-7730: remove editor that unbinds mousedown in the remove handler', async () => {
    const editor = await McEditor.pFromSettings({
      ...settings,
      setup: (editor: Editor) => {
        editor.on('remove', () => {
          // the native events have all been unbound
          // so unbinding 'mousedown' now must do nothing or it will throw an exception
          editor.off('mousedown');
        });
      }
    });
    McEditor.remove(editor);
  });
});
