import { Mouse, Waiter } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { SugarBody } from '@ephox/sugar';
import { TinyHooks, TinySelections, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/image/Plugin';

import { assertCleanHtml, assertInputValue, fakeEvent, fillActiveDialog, generalTabLabels, setInputValue } from '../module/Helpers';

describe('browser.tinymce.plugins.image.DialogUpdateTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'image',
    toolbar: 'image',
    indent: false,
    base_url: '/project/tinymce/js/tinymce',
    image_title: true,
    file_picker_callback: (callback: (url: string, meta: Record<string, any>) => void) => {
      callback('https://www.google.com/logos/google.jpg', { width: '200' });
    }
  }, [ Plugin ]);

  it('TBA: Update an image by setting title to empty should remove the existing title attribute', async () => {
    const editor = hook.editor();
    editor.setContent('<p><img src="#1" title="title" /></p>');
    TinySelections.setSelection(editor, [ 0 ], 0, [ 0 ], 1);
    editor.execCommand('mceImage');
    await TinyUiActions.pWaitForDialog(editor);
    assertInputValue(generalTabLabels.src, '#1');
    assertInputValue(generalTabLabels.title, 'title');
    fillActiveDialog({
      src: { value: '#2' },
      title: ''
    });
    TinyUiActions.submitDialog(editor);
    assertCleanHtml('Checking output', editor, '<p><img src="#2"></p>');
  });

  it('TINY-6611: Setting src to empty should remove the existing dimensions settings', async () => {
    const editor = hook.editor();
    editor.setContent('<p><img src="https://www.google.com/logos/google.jpg"  width="200" height="200"/></p>');
    TinySelections.setSelection(editor, [ 0 ], 0, [ 0 ], 1);
    editor.execCommand('mceImage');
    await TinyUiActions.pWaitForDialog(editor);
    assertInputValue(generalTabLabels.src, 'https://www.google.com/logos/google.jpg');
    assertInputValue(generalTabLabels.height, '200');
    assertInputValue(generalTabLabels.width, '200');

    const input = setInputValue(generalTabLabels.src, '');
    fakeEvent(input, 'change');
    assertInputValue(generalTabLabels.height, '');
    assertInputValue(generalTabLabels.width, '');
    TinyUiActions.submitDialog(editor);
    assertCleanHtml('Checking output', editor, '');
  });

  it('TINY-6611: Clicking on Source button should bring expected dimension values from the image', async () => {
    const editor = hook.editor();
    TinySelections.setSelection(editor, [ 0 ], 0, [ 0 ], 1);
    editor.execCommand('mceImage');
    await TinyUiActions.pWaitForDialog(editor);
    Mouse.clickOn(SugarBody.body(), 'button[data-mce-name="Browse files"]');
    await Waiter.pTryUntil('Wait for width to be populated', () => assertInputValue(generalTabLabels.width, '200'));
    TinyUiActions.submitDialog(editor);
    assertCleanHtml('Checking output', editor, '<p><img src="https://www.google.com/logos/google.jpg" alt="" width="200"></p>');
  });

  it('TINY-11670: floating images should lose the float if put in a caption', async () => {
    const editor = hook.editor();
    editor.options.set('image_caption', true);
    editor.setContent('<p><img src="https://www.google.com/logos/google.jpg" style="border: 2px solid red; float: left" width="200" height="200"/></p>');
    TinySelections.setSelection(editor, [ 0 ], 0, [ 0 ], 1);
    editor.execCommand('mceImage');
    const dialog = await TinyUiActions.pWaitForDialog(editor);
    Mouse.clickByLabel(dialog, generalTabLabels.caption);
    assertInputValue(generalTabLabels.caption, 'on');

    TinyUiActions.submitDialog(editor);
    assertCleanHtml('Checking output', editor, '<figure class="image"><img style="border: 2px solid red;" src="https://www.google.com/logos/google.jpg" width="200" height="200"><figcaption>Caption</figcaption></figure>');
    editor.options.unset('image_caption');
  });

  it('TINY-11670: floating images should not lose the float if is not put in a caption', async () => {
    const editor = hook.editor();
    editor.setContent('<p><img src="https://www.google.com/logos/google.jpg" style="border: 2px solid red; float: left" width="200" height="200"/></p>');
    TinySelections.setSelection(editor, [ 0 ], 0, [ 0 ], 1);
    editor.execCommand('mceImage');
    await TinyUiActions.pWaitForDialog(editor);
    setInputValue(generalTabLabels.height, '300');
    setInputValue(generalTabLabels.width, '300');
    assertInputValue(generalTabLabels.height, '300');
    assertInputValue(generalTabLabels.width, '300');
    TinyUiActions.submitDialog(editor);
    assertCleanHtml('Checking output', editor, '<p><img style="border: 2px solid red; float: left;" src="https://www.google.com/logos/google.jpg" width="300" height="300"></p>');
  });
});
