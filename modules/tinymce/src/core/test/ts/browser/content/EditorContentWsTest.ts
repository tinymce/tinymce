import { describe, it } from '@ephox/bedrock-client';
import { McEditor, TinyAssertions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.core.content.EditorContentWsTest', () => {

  it('Editor initialized on pre element should retain whitespace on get/set content', async () => {
    const editor = await McEditor.pFromHtml<Editor>('<pre>  a  </pre>', {
      inline: true,
      base_url: '/project/tinymce/js/tinymce'
    });
    TinyAssertions.assertContent(editor, '  a  ');
    editor.setContent('  b  ');
    TinyAssertions.assertContent(editor, '  b  ');
    McEditor.remove(editor);
  });
});
