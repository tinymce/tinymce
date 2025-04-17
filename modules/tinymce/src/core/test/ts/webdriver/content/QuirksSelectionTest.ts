import { RealMouse } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { Unicode } from '@ephox/katamari';
import { TinyAssertions, TinyHooks } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.selection.QuirksSelectionTest', () => {
  const hook = TinyHooks.bddSetup<Editor>({
    indent: false,
    entities: 'raw',
    base_url: '/project/tinymce/js/tinymce'
  }, []);

  it('TINY-11676: pressing enter after clicking on a `p` containg a floating `img` in FireFox should not duplicate the image', async () => {
    const editor = hook.editor();
    const initialContent = '<p><strong><img style="display: block; margin-left: auto;" src="img.jpg" width="1" height="1"></strong></p>';
    editor.setContent(initialContent);
    await RealMouse.pClickOn('iframe => body => p');
    editor.execCommand('mceInsertNewLine');
    TinyAssertions.assertContent(editor, `<p>${Unicode.nbsp}</p>` + initialContent);
  });
});
