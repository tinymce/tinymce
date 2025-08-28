import { describe, it } from '@ephox/bedrock-client';
import { McEditor } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.core.init.InitEditorOnHiddenElementTest', () => {

  // Firefox specific test, errors were thrown when the editor was initialised on hidden element.
  it('editor initializes successfully', async () => {
    const editor = await McEditor.pFromHtml<Editor>('<textarea style="display:none;"></textarea>', {
      base_url: '/project/tinymce/js/tinymce'
    });
    editor.focus();
    McEditor.remove(editor);
  });
});
