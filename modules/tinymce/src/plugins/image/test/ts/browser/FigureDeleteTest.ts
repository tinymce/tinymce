import { Mouse } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks, TinySelections, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/image/Plugin';

import { generalTabSelectors, setInputValue } from '../module/Helpers';

describe('browser.tinymce.plugins.image.FigureDeleteTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'image',
    toolbar: 'image',
    image_caption: true,
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin ], true);

  it('TBA: removing src in dialog should remove figure element', async () => {
    const editor = hook.editor();
    editor.setContent('<figure class="image"><img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" alt="" /><figcaption>x</figcaption></figure>');
    TinySelections.setSelection(editor, [], 1, [], 2);
    TinyUiActions.clickOnToolbar(editor, 'button[aria-label="Insert/edit image"]');
    await TinyUiActions.pWaitForDialog(editor);
    setInputValue(generalTabSelectors.src, '');
    TinyUiActions.submitDialog(editor);
    TinyAssertions.assertContent(editor, '');
  });

  it('TBA: clicking caption textbox removes figure and adds image only', async () => {
    const editor = hook.editor();
    editor.setContent('<figure class="image"><img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" alt="" /><figcaption>x</figcaption></figure>');
    TinySelections.setSelection(editor, [], 1, [], 2);
    TinyUiActions.clickOnToolbar(editor, 'button[aria-label="Insert/edit image"]');
    const dialog = await TinyUiActions.pWaitForDialog(editor);
    Mouse.clickOn(dialog, 'label:contains("Show caption") input[type="checkbox"]');
    TinyUiActions.submitDialog(editor);
    TinyAssertions.assertContentPresence(editor, { img: 1, figure: 0, figcaption: 0 });
  });
});
