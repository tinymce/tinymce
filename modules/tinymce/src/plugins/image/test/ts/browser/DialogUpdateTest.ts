import { Mouse, Waiter } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { SugarBody } from '@ephox/sugar';
import { TinyHooks, TinySelections, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/image/Plugin';

import { assertCleanHtml, assertInputValue, fakeEvent, fillActiveDialog, generalTabSelectors, setInputValue } from '../module/Helpers';

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
    assertInputValue(generalTabSelectors.src, '#1');
    assertInputValue(generalTabSelectors.title, 'title');
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
    assertInputValue(generalTabSelectors.src, 'https://www.google.com/logos/google.jpg');
    assertInputValue(generalTabSelectors.height, '200');
    assertInputValue(generalTabSelectors.width, '200');

    const input = setInputValue(generalTabSelectors.src, '');
    fakeEvent(input, 'change');
    assertInputValue(generalTabSelectors.height, '');
    assertInputValue(generalTabSelectors.width, '');
    TinyUiActions.submitDialog(editor);
    assertCleanHtml('Checking output', editor, '');
  });

  it('TINY-6611: Clicking on Source button should bring expected dimension values from the image', async () => {
    const editor = hook.editor();
    TinySelections.setSelection(editor, [ 0 ], 0, [ 0 ], 1);
    editor.execCommand('mceImage');
    await TinyUiActions.pWaitForDialog(editor);
    Mouse.clickOn(SugarBody.body(), 'button[title="Browse files"]');
    await Waiter.pTryUntil('Wait for width to be populated', () => assertInputValue(generalTabSelectors.width, '200'));
    TinyUiActions.submitDialog(editor);
    assertCleanHtml('Checking output', editor, '<p><img src="https://www.google.com/logos/google.jpg" alt="" width="200"></p>');
  });
});
