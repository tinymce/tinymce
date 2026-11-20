import { Mouse, UiFinder, Waiter } from '@ephox/agar';
import { Assert, describe, it } from '@ephox/bedrock-client';
import { ImageSize, SugarElement } from '@ephox/sugar';
import { TinyDom, TinyHooks, TinySelections, TinyUiActions } from '@ephox/wrap-mcagar';

import type Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/image/Plugin';

import { assertCleanHtml, assertInputValue, fakeEvent, generalTabLabels, setInputValue } from '../module/Helpers';

describe('browser.tinymce.plugins.image.ImageResizeTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'image',
    toolbar: 'image',
    base_url: '/project/tinymce/js/tinymce',
    file_picker_callback: (callback: (url: string) => void) => {
      // eslint-disable-next-line no-console
      console.log('file picker pressed');
      callback('data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7');
    }
  }, [ Plugin ]);

  const createImageDataUrl = (width: number, height: number): string => {
    const canvas = SugarElement.fromTag('canvas');
    canvas.dom.width = width;
    canvas.dom.height = height;
    return canvas.dom.toDataURL();
  };

  const imageUrl = createImageDataUrl(20, 10);
  const tallImageUrl = createImageDataUrl(10, 30);

  const pOpenDialogForImage = async (editor: Editor, html: string): Promise<void> => {
    editor.setContent(html);
    const image = UiFinder.findIn<HTMLImageElement>(TinyDom.body(editor), 'img').getOrDie();
    await Waiter.pTryUntil('Image should be loaded in the editor', () => Assert.eq('Image should have a natural width', true, image.dom.naturalWidth > 0));
    TinySelections.select(editor, 'img', []);
    editor.execCommand('mceImage');
    await TinyUiActions.pWaitForDialog(editor);
  };

  it('TBA: image proportion constrains should work directly', async () => {
    const editor = hook.editor();
    TinyUiActions.clickOnToolbar(editor, 'button[aria-label="Insert/edit image"]');
    const dialog = await TinyUiActions.pWaitForDialog(editor);
    Mouse.clickOn(dialog, 'button.tox-browse-url');
    await Waiter.pTryUntil('did not find width input with value 1', () => assertInputValue(generalTabLabels.width, '1'));
    setInputValue(generalTabLabels.height, '5');
    await Waiter.pTryUntil('did not find width input with value 5', () => assertInputValue(generalTabLabels.width, '5'));
    TinyUiActions.submitDialog(editor);
    assertCleanHtml('Checking output', editor, '<p><img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" alt="" width="5" height="5"></p>');
  });

  it('TINYMCE-9866: should leave both fields blank and the image unchanged when it has no dimensions', async () => {
    const editor = hook.editor();
    await pOpenDialogForImage(editor, `<p><img src="${imageUrl}"></p>`);
    assertInputValue(generalTabLabels.width, '');
    assertInputValue(generalTabLabels.height, '');
    TinyUiActions.submitDialog(editor);
    assertCleanHtml('Image should be unchanged', editor, `<p><img src="${imageUrl}"></p>`);
  });

  it('TINYMCE-9866: should leave the missing height blank and the image unchanged', async () => {
    const editor = hook.editor();
    await pOpenDialogForImage(editor, `<p><img src="${imageUrl}" width="40"></p>`);
    assertInputValue(generalTabLabels.width, '40');
    assertInputValue(generalTabLabels.height, '');
    TinyUiActions.submitDialog(editor);
    assertCleanHtml('Image should be unchanged', editor, `<p><img src="${imageUrl}" width="40"></p>`);
  });

  it('TINYMCE-9866: should leave the blank height blank when changing the width', async () => {
    const editor = hook.editor();
    await pOpenDialogForImage(editor, `<p><img src="${imageUrl}" width="40"></p>`);
    setInputValue(generalTabLabels.width, '60');
    assertInputValue(generalTabLabels.height, '');
    TinyUiActions.submitDialog(editor);
    assertCleanHtml('Only the width should be written', editor, `<p><img src="${imageUrl}" width="60"></p>`);
  });

  it('TINYMCE-9866: should use the natural ratio when typing into the blank height', async () => {
    const editor = hook.editor();
    await pOpenDialogForImage(editor, `<p><img src="${imageUrl}" width="40"></p>`);
    setInputValue(generalTabLabels.height, '30');
    assertInputValue(generalTabLabels.width, '60');
    TinyUiActions.submitDialog(editor);
    assertCleanHtml('Both dimensions should be written', editor, `<p><img src="${imageUrl}" width="60" height="30"></p>`);
  });

  it('TINYMCE-9866: should use the natural ratio when typing into the blank width', async () => {
    const editor = hook.editor();
    await pOpenDialogForImage(editor, `<p><img src="${imageUrl}" height="30"></p>`);
    setInputValue(generalTabLabels.width, '30');
    assertInputValue(generalTabLabels.height, '15');
    TinyUiActions.submitDialog(editor);
    assertCleanHtml('Both dimensions should be written', editor, `<p><img src="${imageUrl}" width="30" height="15"></p>`);
  });

  it('TINYMCE-9866: should use the natural ratio for a width set in styles', async () => {
    const editor = hook.editor();
    await pOpenDialogForImage(editor, `<p><img style="width: 40px;" src="${imageUrl}"></p>`);
    assertInputValue(generalTabLabels.width, '40');
    assertInputValue(generalTabLabels.height, '');
    setInputValue(generalTabLabels.height, '10');
    assertInputValue(generalTabLabels.width, '20');
    TinyUiActions.cancelDialog(editor);
  });

  it('TINYMCE-9866: should leave the other field blank when both are blank, then use the natural ratio for the blank one', async () => {
    const editor = hook.editor();
    await pOpenDialogForImage(editor, `<p><img src="${imageUrl}"></p>`);
    setInputValue(generalTabLabels.width, '40');
    assertInputValue(generalTabLabels.height, '');
    setInputValue(generalTabLabels.height, '10');
    assertInputValue(generalTabLabels.width, '20');
    TinyUiActions.submitDialog(editor);
    assertCleanHtml('Both dimensions should be written', editor, `<p><img src="${imageUrl}" width="20" height="10"></p>`);
  });

  it('TINYMCE-9866: should use the natural ratio after clearing a field and typing into it', async () => {
    const editor = hook.editor();
    await pOpenDialogForImage(editor, `<p><img src="${imageUrl}" width="100" height="100"></p>`);
    setInputValue(generalTabLabels.height, '');
    assertInputValue(generalTabLabels.width, '100');
    setInputValue(generalTabLabels.width, '100');
    setInputValue(generalTabLabels.height, '30');
    assertInputValue(generalTabLabels.width, '60');
    TinyUiActions.cancelDialog(editor);
  });

  it('TINYMCE-9866: should not use the natural ratio when the lock is off', async () => {
    const editor = hook.editor();
    await pOpenDialogForImage(editor, `<p><img src="${imageUrl}" width="40"></p>`);
    const dialog = await TinyUiActions.pWaitForDialog(editor);
    Mouse.clickOn(dialog, 'button.tox-lock');
    setInputValue(generalTabLabels.height, '30');
    assertInputValue(generalTabLabels.width, '40');
    TinyUiActions.submitDialog(editor);
    assertCleanHtml('Both dimensions should be written as typed', editor, `<p><img src="${imageUrl}" width="40" height="30"></p>`);
  });

  it('TINYMCE-9866: should not use the natural ratio when the other field is a percentage', async () => {
    const editor = hook.editor();
    await pOpenDialogForImage(editor, `<p><img src="${imageUrl}" width="50%"></p>`);
    setInputValue(generalTabLabels.height, '30');
    assertInputValue(generalTabLabels.width, '50%');
    TinyUiActions.cancelDialog(editor);
  });

  it('TINYMCE-9866: should not use the old image ratio straight after the source changes', async () => {
    const editor = hook.editor();
    await pOpenDialogForImage(editor, `<p><img src="${imageUrl}" width="40"></p>`);
    const input = setInputValue(generalTabLabels.src, '#2');
    fakeEvent(input, 'change');
    setInputValue(generalTabLabels.height, '30');
    assertInputValue(generalTabLabels.width, '40');
    TinyUiActions.cancelDialog(editor);
  });

  it('TINYMCE-9866: should use the new image ratio when the source changes', async () => {
    const editor = hook.editor();
    await pOpenDialogForImage(editor, `<p><img src="${imageUrl}" width="40"></p>`);
    const input = setInputValue(generalTabLabels.src, tallImageUrl);
    fakeEvent(input, 'change');
    await Waiter.pTryUntil('Dimensions should be set from the new image', () => {
      assertInputValue(generalTabLabels.width, '10');
      assertInputValue(generalTabLabels.height, '30');
    });
    setInputValue(generalTabLabels.width, '');
    setInputValue(generalTabLabels.height, '30');
    setInputValue(generalTabLabels.width, '20');
    assertInputValue(generalTabLabels.height, '60');
    TinyUiActions.cancelDialog(editor);
  });

  it('TINYMCE-9866: should use the new image ratio when the file picker only gives a width', async () => {
    const editor = hook.editor();
    const originalPicker = editor.options.get('file_picker_callback');
    editor.options.set('file_picker_callback', (callback: (url: string, meta: Record<string, string>) => void) => callback(tallImageUrl, { width: '20' }));
    try {
      await pOpenDialogForImage(editor, `<p><img src="${imageUrl}" width="40"></p>`);
      const dialog = await TinyUiActions.pWaitForDialog(editor);
      Mouse.clickOn(dialog, 'button.tox-browse-url');
      await Waiter.pTryUntil('Width should be set from the file picker', () => assertInputValue(generalTabLabels.width, '20'));
      assertInputValue(generalTabLabels.height, '');
      // The new image's ratio is known once it loads, so retry until typing into the blank height uses it
      await Waiter.pTryUntil('Width should use the new image ratio', () => {
        setInputValue(generalTabLabels.height, '');
        setInputValue(generalTabLabels.width, '20');
        setInputValue(generalTabLabels.height, '90');
        assertInputValue(generalTabLabels.width, '30');
      });
      TinyUiActions.cancelDialog(editor);
    } finally {
      editor.options.set('file_picker_callback', originalPicker);
    }
  });

  it('TINYMCE-9866: should ignore the size of an image that finishes loading after the source has changed again', async () => {
    const editor = hook.editor();
    await pOpenDialogForImage(editor, `<p><img src="${imageUrl}" width="40"></p>`);
    fakeEvent(setInputValue(generalTabLabels.src, tallImageUrl), 'change');
    fakeEvent(setInputValue(generalTabLabels.src, '#2'), 'change');
    // Load the same image so the dialog's earlier load has finished before checking
    await ImageSize.getImageSizeFromUrl(tallImageUrl);
    await Waiter.pWait(0);
    assertInputValue(generalTabLabels.width, '40');
    assertInputValue(generalTabLabels.height, '');
    setInputValue(generalTabLabels.height, '30');
    assertInputValue(generalTabLabels.width, '40');
    TinyUiActions.cancelDialog(editor);
  });

  it('TINYMCE-9866: should use the natural ratio in a dialog with tabs', async () => {
    const editor = hook.editor();
    editor.options.set('image_advtab', true);
    try {
      await pOpenDialogForImage(editor, `<p><img src="${imageUrl}" width="40"></p>`);
      setInputValue(generalTabLabels.height, '30');
      assertInputValue(generalTabLabels.width, '60');
      TinyUiActions.submitDialog(editor);
      assertCleanHtml('Both dimensions should be written', editor, `<p><img src="${imageUrl}" width="60" height="30"></p>`);
    } finally {
      editor.options.unset('image_advtab');
    }
  });
});
