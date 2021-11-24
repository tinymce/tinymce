import { before, describe, it } from '@ephox/bedrock-client';
import { McEditor } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import { RawEditorOptions } from 'tinymce/core/api/OptionTypes';
import Plugin from 'tinymce/plugins/paste/Plugin';

describe('browser.tinymce.plugins.paste.PasteSettingsTest', () => {
  before(() => {
    Plugin();
  });

  const pCreateInlineEditor = (settings: RawEditorOptions) =>
    McEditor.pFromSettings<Editor>({
      ...settings,
      inline: true,
      base_url: '/project/tinymce/js/tinymce'
    });

  it('TBA: paste_as_text setting', async () => {
    const editor = await pCreateInlineEditor({
      paste_as_text: true,
      plugins: 'paste'
    });
    assert.equal(editor.plugins.paste.clipboard.pasteFormat.get(), 'text');
    McEditor.remove(editor);
  });
});
