import { Clipboard } from '@ephox/agar';
import { beforeEach, context, describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyDom, TinyHooks } from '@ephox/wrap-mcagar';

import type Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.core.paste.PasteRetainAttributesTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    indent: false,
    paste_webkit_styles: 'all'
  }, []);

  context('XSS paste tests', () => {
    const payload = [
      '<p>',
      '<a data-mce-href="javascript:alert(1)" href="#">Click here</a>',
      '<img data-mce-src="javascript:alert(1)" src="about:blank">',
      `<span data-mce-style="background: url('javascript:alert(1)');" style="color: red;">Red</span>`,
      '</p>'
    ].join('');
    const expectedOutput = [
      '<p>',
      '<a href="#">Click here</a>',
      '<img src="about:blank">',
      `<span style="color: red;">Red</span>`,
      '</p>'
    ].join('');

    beforeEach(() => {
      const editor = hook.editor();
      editor.setContent('');
    });

    it('TINY-14333: Paste XSS payload using mceInsertClipboardContent command', () => {
      const editor = hook.editor();

      editor.execCommand('mceInsertClipboardContent', false, { html: payload });
      TinyAssertions.assertContent(editor, expectedOutput);
    });

    it('TINY-14333: Paste XSS payload using paste event', () => {
      const editor = hook.editor();

      Clipboard.pasteItems(TinyDom.body(editor), { 'text/html': payload });
      TinyAssertions.assertContent(editor, expectedOutput);
    });
  });
});
