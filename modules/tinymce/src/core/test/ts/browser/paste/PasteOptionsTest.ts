import { describe, it } from '@ephox/bedrock-client';
import { McEditor, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import { RawEditorOptions } from 'tinymce/core/api/OptionTypes';

describe('browser.tinymce.core.paste.PasteOptionsTest', () => {
  const pCreateInlineEditor = (settings: RawEditorOptions) =>
    McEditor.pFromSettings<Editor>({
      ...settings,
      inline: true,
      base_url: '/project/tinymce/js/tinymce'
    });

  it('TBA: paste_as_text option toggles the paste as text mode', async () => {
    const editor = await pCreateInlineEditor({
      paste_as_text: true,
      toolbar: 'pastetext'
    });
    editor.focus();
    await TinyUiActions.pWaitForUi(editor, 'button.tox-tbtn--enabled[title="Paste as text"]');
    McEditor.remove(editor);
  });
});
