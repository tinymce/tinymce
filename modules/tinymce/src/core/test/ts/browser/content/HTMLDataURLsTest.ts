import { describe, it } from '@ephox/bedrock-client';
import { McEditor } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

describe('browser.tinymce.core.content.HTMLDataURLsTest', () => {

  const initialContent = '<p><a href="data:text/plain;base64,SGVsbG8sIHdvcmxkCg==">Click me</a></p>';

  const getSettings = (hasDataUrls: boolean) => ({
    base_url: '/project/tinymce/js/tinymce',
    menubar: false,
    toolbar: false,
    statusbar: false,
    allow_html_data_urls: hasDataUrls
  });

  it('TINY-5951: Editor should not allow data urls by default', async () => {
    const editor = await McEditor.pFromSettings(getSettings(false));
    editor.setContent(initialContent);
    const content = editor.getContent();
    assert.equal(content, '<p><a>Click me</a></p>', 'Href should be removed');
    McEditor.remove(editor);
  });

  it('TINY-5951: Editor should allow data urls when allow_html_data_urls is true', async () => {
    const editor = await McEditor.pFromSettings(getSettings(true));
    editor.setContent(initialContent);
    const content = editor.getContent();
    assert.equal(content, initialContent, 'Href should not be removed');
    McEditor.remove(editor);
  });
});
