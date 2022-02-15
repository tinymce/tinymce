import { describe, it } from '@ephox/bedrock-client';
import { McEditor } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.themes.silver.editor.DefaultHeightTest', () => {
  const baseSettings = {
    base_url: '/project/tinymce/js/tinymce'
  };

  const assertEditorHeight = (editor: Editor, expected: number) => assert.equal(editor.getContainer().offsetHeight, expected);

  it('TINY-8443: Default height should be 400px', async () => {
    const editor = await McEditor.pFromSettings<Editor>(baseSettings);
    assertEditorHeight(editor, 400);
    McEditor.remove(editor);
  });

  it('TINY-8443: Height option takes precedence over the default', async () => {
    const editor = await McEditor.pFromSettings<Editor>({ ...baseSettings, height: 500 });
    assertEditorHeight(editor, 500);
    McEditor.remove(editor);
  });

  it('TINY-8443: CSS height takes precedence in the absence of the height option when larger than the default height', async () => {
    let editor = await McEditor.pFromHtml<Editor>('<div style="height: 600px"></div>', baseSettings);
    assertEditorHeight(editor, 600);
    McEditor.remove(editor);

    // Test with another height unit
    editor = await McEditor.pFromHtml<Editor>('<div style="height: 50rem"></div>', baseSettings);
    assertEditorHeight(editor, 800);
    McEditor.remove(editor);
  });

  it('TINY-8443: Use default height if CSS height is less and the height option is not specified', async () => {
    const editor = await McEditor.pFromHtml<Editor>('<div style="height: 200px"></div>', baseSettings);
    assertEditorHeight(editor, 400);
    McEditor.remove(editor);
  });

  it('TINY-8443: The height option should take precedence over CSS height', async () => {
    const editor = await McEditor.pFromHtml<Editor>('<div style="height: 600px"></div>', { ...baseSettings, height: 721 });
    assertEditorHeight(editor, 721);
    McEditor.remove(editor);
  });

  it('TINY-8443: The min-height option defaults to 100px', async () => {
    const editor = await McEditor.pFromSettings<Editor>({ ...baseSettings, height: 80 });
    assertEditorHeight(editor, 100);
    McEditor.remove(editor);
  });
});
