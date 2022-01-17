import { describe, it } from '@ephox/bedrock-client';
import { McEditor } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.core.dom.ContentCssCorsTest', () => {
  const settings = {
    base_url: '/project/tinymce/js/tinymce',
    menubar: false,
    toolbar: false
  };

  const assertCorsLinkPresence = (editor: Editor, expected: boolean) => {
    const corsLinks = editor.getDoc().querySelectorAll('link[crossorigin="anonymous"]');
    assert.equal(corsLinks.length > 0, expected, 'should have link with crossorigin="anonymous"');
  };

  it('assert crossorigin link presence with setting set', async () => {
    const editor = await McEditor.pFromSettings<Editor>({ ...settings, content_css_cors: true });
    assertCorsLinkPresence(editor, true);
    McEditor.remove(editor);
  });

  it('assert crossorigin link presence with no setting set', async () => {
    const editor = await McEditor.pFromSettings<Editor>(settings);
    assertCorsLinkPresence(editor, false);
    McEditor.remove(editor);
  });
});
