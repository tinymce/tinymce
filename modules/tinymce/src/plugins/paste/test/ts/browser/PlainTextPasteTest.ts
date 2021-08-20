import { Clipboard, Waiter } from '@ephox/agar';
import { before, describe, it } from '@ephox/bedrock-client';
import { Arr, Obj } from '@ephox/katamari';
import { McEditor, TinyAssertions, TinyDom } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import { RawEditorSettings } from 'tinymce/core/api/SettingsTypes';
import PromisePolyfill from 'tinymce/core/api/util/Promise';
import Plugin from 'tinymce/plugins/paste/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.plugins.paste.PlainTextPaste', () => {
  before(() => {
    Theme();
    Plugin();
  });

  const srcText = 'one\r\ntwo\r\n\r\nthree\r\n\r\n\r\nfour\r\n\r\n\r\n\r\n.';

  const pasteData = {
    Firefox: {
      'text/plain': srcText,
      'text/html': 'one<br>two<br><br>three<br><br><br>four<br><br><br><br>.'
    },
    Chrome: {
      'text/plain': srcText,
      'text/html': '<div>one</div><div>two</div><div><br></div><div>three</div><div><br></div><div><br></div><div>four</div><div><br></div><div><br></div><div><br></div><div>.'
    },
    Edge: {
      'text/plain': srcText,
      'text/html': '<div>one<br>two</div><div>three</div><div><br>four</div><div><br></div><div>.</div>'
    },
    IE: {
      'text/plain': srcText,
      'text/html': '<p>one<br>two</p><p>three</p><p><br>four</p><p><br></p><p>.</p>'
    }
  };

  const expectedWithRootBlock = '<p>one<br />two</p><p>three</p><p><br />four</p><p>&nbsp;</p><p>.</p>';
  const expectedWithRootBlockAndAttrs = '<p class="attr">one<br />two</p><p class="attr">three</p><p class="attr"><br />four</p><p class="attr">&nbsp;</p><p class="attr">.</p>';
  const expectedWithoutRootBlock = 'one<br />two<br /><br />three<br /><br /><br />four<br /><br /><br /><br />.';

  const pCreateEditorFromSettings = (settings: RawEditorSettings) =>
    McEditor.pFromSettings<Editor>({
      ...settings,
      base_url: '/project/tinymce/js/tinymce',
      indent: false
    });

  const pAssertClipboardPaste = (editor: Editor, expected: string, data: Record<string, Record<string, string>>) => {
    const arr = Obj.mapToArray(data, (data, label): [ string, Record<string, string>] => [ label, data ]);
    return Arr.foldl(arr, (p, [ label, data ]) => p.then(async () => {
      editor.setContent('');
      Clipboard.pasteItems(TinyDom.body(editor), data);
      await Waiter.pTryUntil(`Wait for ${label} paste to succeed`, () => TinyAssertions.assertContent(editor, expected));
    }), PromisePolyfill.resolve());
  };

  it('TBA: Assert forced_root_block <p></p> is added to the pasted data', async () => {
    const editor = await pCreateEditorFromSettings({
      plugins: 'paste',
      forced_root_block: 'p' // default
    });
    await pAssertClipboardPaste(editor, expectedWithRootBlock, pasteData);
    McEditor.remove(editor);
  });

  it('TBA: Assert forced_root_block <p class="attr"></p> is added to the pasted data', async () => {
    const editor = await pCreateEditorFromSettings({
      plugins: 'paste',
      forced_root_block: 'p',
      forced_root_block_attrs: {
        class: 'attr'
      }
    });
    await pAssertClipboardPaste(editor, expectedWithRootBlockAndAttrs, pasteData);
    McEditor.remove(editor);
  });

  it('TBA: Assert forced_root_block is not added to the pasted data', async () => {
    const editor = await pCreateEditorFromSettings({
      plugins: 'paste',
      forced_root_block: false
    });
    await pAssertClipboardPaste(editor, expectedWithoutRootBlock, pasteData);
    McEditor.remove(editor);
  });
});
