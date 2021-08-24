import { Clipboard } from '@ephox/agar';
import { before, describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyDom, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Env from 'tinymce/core/api/Env';
import Plugin from 'tinymce/plugins/paste/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.plugins.paste.PasteStylesTest', () => {
  before(function () {
    if (!Env.webkit) {
      this.skip();
    }
  });

  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'paste',
    valid_styles: 'font-family,color',
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin, Theme ]);

  it('TBA: Paste span with encoded style attribute, paste_webkit_styles: font-family', () => {
    const editor = hook.editor();
    editor.settings.paste_webkit_styles = 'font-family';
    editor.setContent('<p>test</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 4);
    Clipboard.pasteItems(TinyDom.body(editor), { 'text/html': '<span style="font-family: &quot;a b&quot;;color:green;">b</span>' });
    TinyAssertions.assertContent(editor, `<p><span style="font-family: 'a b';">b</span></p>`);
  });

  it('TBA: Paste span with encoded style attribute, paste_webkit_styles: all', () => {
    const editor = hook.editor();
    editor.settings.paste_webkit_styles = 'all';
    editor.setContent('<p>test</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 4);
    Clipboard.pasteItems(TinyDom.body(editor), { 'text/html': '<span style="font-family: &quot;a b&quot;; color: green;">b</span>' });
    TinyAssertions.assertContent(editor, `<p><span style="font-family: 'a b'; color: green;">b</span></p>`);
  });

  it('TBA: Paste span with encoded style attribute, paste_webkit_styles: none', () => {
    const editor = hook.editor();
    editor.settings.paste_webkit_styles = 'none';
    editor.setContent('<p>test</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 4);
    Clipboard.pasteItems(TinyDom.body(editor), { 'text/html': '<span style="font-family: &quot;a b&quot;;">b</span>' });
    TinyAssertions.assertContent(editor, '<p>b</p>');
  });

  it('TBA: Paste span with encoded style attribute, paste_remove_styles_if_webkit: false', () => {
    const editor = hook.editor();
    editor.settings.paste_remove_styles_if_webkit = false;
    editor.setContent('<p>test</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 4);
    Clipboard.pasteItems(TinyDom.body(editor), { 'text/html': '<span style="font-family: &quot;a b&quot;;">b</span>' });
    TinyAssertions.assertContent(editor, `<p><span style="font-family: 'a b';">b</span></p>`);
  });
});
