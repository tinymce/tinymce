import { Clipboard, Waiter } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { Arr, Obj } from '@ephox/katamari';
import { McEditor, TinyAssertions, TinyDom } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import { RawEditorOptions } from 'tinymce/core/api/OptionTypes';

describe('browser.tinymce.core.paste.PlainTextPaste', () => {
  const srcText = 'one\r\ntwo\r\n\r\nthree\r\n\r\n\r\nfour\r\n\r\n\r\n\r\n.';

  const pasteData = {
    Firefox: {
      'text/plain': srcText,
      'text/html': 'one<br>two<br><br>three<br><br><br>four<br><br><br><br>.'
    },
    Chrome: {
      'text/plain': srcText,
      'text/html': '<div>one</div><div>two</div><div><br></div><div>three</div><div><br></div><div><br></div><div>four</div><div><br></div><div><br></div><div><br></div><div>.'
    }
  };

  const expectedWithRootBlock = '<p>one<br>two</p><p>three</p><p><br>four</p><p>&nbsp;</p><p>.</p>';
  const expectedWithRootBlockAndAttrs = '<p class="attr">one<br>two</p><p class="attr">three</p><p class="attr"><br>four</p><p class="attr">&nbsp;</p><p class="attr">.</p>';

  const pCreateEditorFromSettings = (settings: RawEditorOptions) =>
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
    }), Promise.resolve());
  };

  it('TBA: Assert forced_root_block <p></p> is added to the pasted data', async () => {
    const editor = await pCreateEditorFromSettings({
      forced_root_block: 'p' // default
    });
    await pAssertClipboardPaste(editor, expectedWithRootBlock, pasteData);
    McEditor.remove(editor);
  });

  it('TBA: Assert forced_root_block <p class="attr"></p> is added to the pasted data', async () => {
    const editor = await pCreateEditorFromSettings({
      forced_root_block: 'p',
      forced_root_block_attrs: {
        class: 'attr'
      }
    });
    await pAssertClipboardPaste(editor, expectedWithRootBlockAndAttrs, pasteData);
    McEditor.remove(editor);
  });
});
