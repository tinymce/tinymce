import { Assert, describe, it } from '@ephox/bedrock-client';
import { Css } from '@ephox/sugar';
import { McEditor, TinyDom } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.themes.silver.editor.toolbar.MultipleInlineToolbarVisibilityTest', () => {

  const settings = {
    inline: true,
    menubar: false,
    toolbar: 'bold italic underline | alignleft aligncenter alignright alignjustify',
    base_url: '/project/tinymce/js/tinymce'
  };

  const pWaitForFocus = (editor: Editor) => new Promise((resolve) => {
    editor.once('focus', resolve);
    editor.focus();
  });

  it('TINY-8503: Does not leave two toolbars showing', async () => {
    const editorOne = await McEditor.pFromSettings<Editor>(settings);
    const editorTwo = await McEditor.pFromSettings<Editor>(settings);
    editorOne.setContent('<p id="number1"><strong>blarg</strong></p>');
    editorTwo.setContent('<p id="number2">blarg</p>');

    await Promise.all([
      pWaitForFocus(editorOne),
      pWaitForFocus(editorTwo)
    ]);

    Assert.eq('editor 2 toolbar should be showing', 'flex', Css.get(TinyDom.container(editorTwo), 'display'));
    Assert.eq('editor 1 toolbar should be hidden', 'none', Css.get(TinyDom.container(editorOne), 'display'));

    McEditor.remove(editorOne);
    McEditor.remove(editorTwo);
  });

  it('TINY-8594: No flickering when switching', async () => {
    const editorOne = await McEditor.pFromHtml<Editor>('<div><p id="number1"><strong>Editor one</strong></p></div>', settings);
    const editorTwo = await McEditor.pFromHtml<Editor>('<div><p id="number2"><strong>Editor two</strong></p></div>', settings);

    await pWaitForFocus(editorOne);
    Assert.eq('Editor 1 toolbar should be showing', 'flex', Css.get(TinyDom.container(editorOne), 'display'));

    await pWaitForFocus(editorTwo);
    Assert.eq('Editor 1 toolbar should be hidden', 'none', Css.get(TinyDom.container(editorOne), 'display'));
    Assert.eq('Editor 2 toolbar should be showing', 'flex', Css.get(TinyDom.container(editorTwo), 'display'));

    McEditor.remove(editorTwo);
    McEditor.remove(editorOne);
  });
});
