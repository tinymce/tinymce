import { before, describe, it } from '@ephox/bedrock-client';
import { McEditor } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import { RawEditorSettings } from 'tinymce/core/api/SettingsTypes';
import Plugin from 'tinymce/plugins/paste/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.plugins.paste.PasteSettingsTest', () => {
  before(() => {
    Theme();
    Plugin();
  });

  const pCreateInlineEditor = (settings: RawEditorSettings) =>
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
