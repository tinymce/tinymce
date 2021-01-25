import { Waiter } from '@ephox/agar';
import { before, describe, it } from '@ephox/bedrock-client';
import { McEditor } from '@ephox/mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import EditorManager from 'tinymce/core/api/EditorManager';
import PromisePolyfill from 'tinymce/core/api/util/Promise';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.core.EditorRemoveTest', () => {
  before(() => Theme());

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
        editor.on('LoadContent', () => {
          // Hook the function called when stylesheets are loaded
          // so we can remove the editor right after starting to load them.
          const realLoadAll = editor.ui.styleSheetLoader.loadAll;
          editor.ui.styleSheetLoader.loadAll = (...args) => {
            realLoadAll.apply(editor.ui.styleSheetLoader, args);
            editor.ui.styleSheetLoader.loadAll = realLoadAll;
            editor.remove();
          };
        });
      }
    }).then(
      () => PromisePolyfill.reject('Expected editor would not load completely'),
      (err) => {
        // As we have deliberately removed the editor during the loading process
        // we have to intercept the error that is thrown by McEditor.pFromHtml.
        if (err === McEditor.errorMessageEditorRemoved) {
          return PromisePolyfill.resolve();
        } else {
          return PromisePolyfill.reject(err);
        }
      }
    );
    // allow the stylesheet loading to finish
    await Waiter.pWait(50);
  });

  it('remove editor where the body has been removed', async () => {
    const editor = await McEditor.pFromHtml<Editor>('<textarea></textarea>', settings);
    const body = editor.getBody();
    body.parentNode.removeChild(body);
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
});
