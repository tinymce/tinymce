import { describe, it } from '@ephox/bedrock-client';
import { McEditor } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.themes.silver.editor.DefaultHeight', () => {
  const baseSettings = {
    base_url: '/project/tinymce/js/tinymce'
  };

  it('TINY-8443: Default height should be 400px', async () => {
    const editor = await McEditor.pFromSettings<Editor>(baseSettings);
    assert.equal(editor.getContainer().offsetHeight, 400);
    McEditor.remove(editor);
  });

  it('TINY-8443: Option heigh takes precedence', async () => {
    const editor = await McEditor.pFromSettings<Editor>({ height: 500, ...baseSettings });
    assert.equal(editor.getContainer().offsetHeight, 500);
    McEditor.remove(editor);
  });

  it('TINY-8443: CSS height takes precendence in the absence of option height', async () => {
    const editor = await McEditor.pFromHtml<Editor>('<div style="height: 600px"></div>', baseSettings);
    assert.equal(editor.getContainer().offsetHeight, 600);
    McEditor.remove(editor);
  });

  it('TINY-8443: Use default height if CSS height is less and option height is not specified', async () => {
    const editor = await McEditor.pFromHtml<Editor>('<div style="height: 200px"></div>', baseSettings);
    assert.equal(editor.getContainer().offsetHeight, 400);
    McEditor.remove(editor);
  });

  it('TINY-8443: Option height should take precedence over CSS height', async () => {
    const editor = await McEditor.pFromHtml<Editor>('<div style="height: 600px"></div>', { height: 721, ...baseSettings });
    assert.equal(editor.getContainer().offsetHeight, 721);
    McEditor.remove(editor);
  });

  it('TINY-8443: Default min-height to 100px', async () => {
    const editor = await McEditor.pFromSettings<Editor>({ height: 80, ...baseSettings });
    assert.equal(editor.getContainer().offsetHeight, 100);
    McEditor.remove(editor);
  });
});
