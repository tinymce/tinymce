import { Clipboard } from '@ephox/agar';
import { before, describe, it } from '@ephox/bedrock-client';
import { PlatformDetection } from '@ephox/sand';
import { TinyAssertions, TinyDom, TinyHooks } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/paste/Plugin';

describe('browser.tinymce.plugins.paste.PasteFormatToggleTest', () => {
  before(function () {
    const browser = PlatformDetection.detect().browser;
    if (!browser.isChromium() && !browser.isSafari()) {
      this.skip();
    }
  });

  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'paste',
    valid_styles: 'font-family,color',
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin ]);

  it('TBA: paste plain text', () => {
    const editor = hook.editor();
    editor.execCommand('mceTogglePlainTextPaste');
    Clipboard.pasteItems(TinyDom.body(editor), { 'text/html': '<p><strong>test</strong></p>' });
    TinyAssertions.assertContent(editor, '<p>test</p>');
    editor.setContent('');
    editor.execCommand('mceTogglePlainTextPaste');
    Clipboard.pasteItems(TinyDom.body(editor), { 'text/html': '<p><strong>test</strong></p>' });
    TinyAssertions.assertContent(editor, '<p><strong>test</strong></p>');
  });
});
