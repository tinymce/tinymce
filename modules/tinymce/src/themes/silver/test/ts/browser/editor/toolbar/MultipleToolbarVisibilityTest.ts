import { Assert, describe, it } from '@ephox/bedrock-client';
import { Css } from '@ephox/sugar';
import { McEditor, TinyDom } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.themes.silver.editor.toolbar.ToolbarDrawerFloatingPositionTest', () => {

  const settings = {
    inline: true,
    menubar: false,
    toolbar: 'bold italic underline | alignleft aligncenter alignright alignjustify',
    base_url: '/project/tinymce/js/tinymce'
  };

  // is there a utils method for this somewhere?
  const asyncTimeout = async (timeout: number) =>
    new Promise((resolve) => setTimeout(resolve, timeout));

  it('TINY-8503 does not leave two toolbars showing', async () => {
    const editorOne = await McEditor.pFromSettings<Editor>(settings);
    const editorTwo = await McEditor.pFromSettings<Editor>(settings);
    editorOne.setContent('<p id="number1"><strong>blarg</strong></p>');
    editorTwo.setContent('<p id="number2">blarg</p>');
    editorOne.focus();
    editorTwo.focus();
    await asyncTimeout(100);
    Assert.eq('editor 2 toolbar should be showing', 'flex', Css.get(TinyDom.container(editorTwo), 'display'));
    Assert.eq('editor 1 toolbar should be hidden', 'none', Css.get(TinyDom.container(editorOne), 'display'));
    McEditor.remove(editorOne);
    McEditor.remove(editorTwo);
  });
});
