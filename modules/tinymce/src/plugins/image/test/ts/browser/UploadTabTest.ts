import { Assertions, FileInput, Files, Mouse, UiFinder, Waiter } from '@ephox/agar';
import { afterEach, describe, it } from '@ephox/bedrock-client';
import { Strings } from '@ephox/katamari';
import { SugarBody, Value } from '@ephox/sugar';
import { TinyHooks, TinySelections, TinyUiActions } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import * as Conversions from 'tinymce/core/file/Conversions';
import Plugin from 'tinymce/plugins/image/Plugin';

describe('browser.tinymce.plugins.image.UploadTabTest', () => {
  const src = 'http://moxiecode.cachefly.net/tinymce/v9/images/logo.png';
  const b64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=';
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'image',
    toolbar: 'image',
    indent: false,
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin ]);

  afterEach(() => {
    const editor = hook.editor();
    editor.options.unset('automatic_uploads');
    editor.options.unset('images_file_types');
    editor.options.unset('images_upload_handler');
    editor.options.unset('image_advtab');
  });

  const closeDialog = (editor: Editor) =>
    TinyUiActions.cancelDialog(editor);

  const pAssertImageTab = async (editor: Editor, title: string, isPresent: boolean) => {
    TinyUiActions.clickOnToolbar(editor, 'button[aria-label="Insert/edit image"]');
    const dialog = await TinyUiActions.pWaitForDialog(editor);
    const expected = {
      ['.tox-tab:contains("' + title + '")']: isPresent ? 1 : 0
    };
    Assertions.assertPresence('Asserting presence', expected, dialog);
    closeDialog(editor);
  };

  const pTriggerUpload = async (editor: Editor, fileExtension: string = 'png') => {
    const blob = await Conversions.uriToBlob(b64);
    await FileInput.pRunOnPatchedFileInput([ Files.createFile(`logo.${fileExtension}`, 0, blob) ], async () => {
      const dialog = await TinyUiActions.pWaitForDialog(editor);
      const button = UiFinder.findIn(dialog, 'button:contains("Browse for an image")').getOrDie();
      Mouse.click(button);
    });
  };

  const pAssertSrcTextValue = (expectedValue: string) => Waiter.pTryUntil('Waited for input to change to expected value', () => {
    const input = UiFinder.findIn<HTMLInputElement>(SugarBody.body(), 'label.tox-label:contains("Source") + div > div > input.tox-textfield').getOrDie();
    assert.equal(Value.get(input), expectedValue, 'Assert field source value ');
  }, 10, 10000);

  const pAssertSrcTextValueStartsWith = (expectedValue: string) => Waiter.pTryUntil('Waited for input to change to start with expected value', () => {
    const input = UiFinder.findIn<HTMLInputElement>(SugarBody.body(), 'label.tox-label:contains("Source") + div > div > input.tox-textfield').getOrDie();
    assert.isTrue(Strings.startsWith(Value.get(input), expectedValue), 'Assert field source value');
  }, 10, 10000);

  it('TBA: Upload tab should not be present without images_upload_url or images_upload_handler', async () => {
    const editor = hook.editor();
    editor.setContent('<p><img src="' + src + '" /></p>');
    TinySelections.select(editor, 'img', []);
    await pAssertImageTab(editor, 'Upload', false);
  });

  it('TBA: Upload tab should be present when images_upload_url is set to some truthy value', async () => {
    const editor = hook.editor();
    editor.setContent('<p><img src="' + src + '" /></p>');
    TinySelections.select(editor, 'img', []);
    editor.options.set('image_advtab', false); // make sure that Advanced tab appears separately
    editor.options.set('images_upload_url', 'postAcceptor.php');
    await pAssertImageTab(editor, 'Upload', true);
    await pAssertImageTab(editor, 'Advanced', false);
    editor.options.set('image_advtab', true);
    editor.options.unset('images_upload_url');
    await pAssertImageTab(editor, 'Upload', false);
    await pAssertImageTab(editor, 'Advanced', true);
  });

  it('TBA: Upload tab should be not be present when images_upload_url is set to some truthy value and image_uploadtab is set to false', async () => {
    const editor = hook.editor();
    editor.setContent('<p><img src="' + src + '" /></p>');
    TinySelections.select(editor, 'img', []);
    editor.options.set('image_uploadtab', false);
    editor.options.set('images_upload_handler', (_blobInfo) => Promise.resolve('file.jpg'));
    await pAssertImageTab(editor, 'Upload', false);
    editor.options.set('image_advtab', true);
    editor.options.unset('image_uploadtab');
    await pAssertImageTab(editor, 'Upload', true);
  });

  it('TBA: Upload tab should be present when images_upload_handler is set to some truthy value', async () => {
    const editor = hook.editor();
    editor.setContent('<p><img src="' + src + '" /></p>');
    TinySelections.select(editor, 'img', []);
    editor.options.set('image_advtab', false); // make sure that Advanced tab appears separately
    editor.options.set('images_upload_handler', (_blobInfo) => Promise.resolve('file.jpg'));
    await pAssertImageTab(editor, 'Upload', true);
    await pAssertImageTab(editor, 'Advanced', false);
    editor.options.set('image_advtab', true);
    editor.options.unset('images_upload_handler');
    await pAssertImageTab(editor, 'Upload', false);
    await pAssertImageTab(editor, 'Advanced', true);
  });

  it('TBA: Image uploader test with custom route', async () => {
    const editor = hook.editor();
    editor.setContent('');
    editor.options.set('images_upload_url', '/custom/imageUpload');
    TinyUiActions.clickOnToolbar(editor, 'button[aria-label="Insert/edit image"]');
    await TinyUiActions.pWaitForDialog(editor);
    TinyUiActions.clickOnUi(editor, '.tox-tab:contains("Upload")');
    await pTriggerUpload(editor);
    await TinyUiActions.pWaitForUi(editor, '.tox-tab:contains("General")');
    await pAssertSrcTextValue('uploaded_image.jpg');
    closeDialog(editor);
  });

  it('TBA: Image uploader test with images_upload_handler', async () => {
    const editor = hook.editor();
    editor.setContent('');
    editor.options.set('images_upload_handler', (_blobInfo) => Promise.resolve('file.jpg'));
    TinyUiActions.clickOnToolbar(editor, 'button[aria-label="Insert/edit image"]');
    await TinyUiActions.pWaitForDialog(editor);
    TinyUiActions.clickOnUi(editor, '.tox-tab:contains("Upload")');
    await pTriggerUpload(editor);
    await TinyUiActions.pWaitForUi(editor, '.tox-tab:contains("General")');
    await pAssertSrcTextValue('file.jpg');
    closeDialog(editor);
  });

  it('TBA: Test that we get full base64 string in images_upload_handler', async () => {
    const editor = hook.editor();
    editor.setContent('');
    editor.options.set('images_upload_handler', (blobInfo) => Promise.resolve(blobInfo.base64()));
    TinyUiActions.clickOnToolbar(editor, 'button[aria-label="Insert/edit image"]');
    await TinyUiActions.pWaitForDialog(editor);
    TinyUiActions.clickOnUi(editor, '.tox-tab:contains("Upload")');
    await pTriggerUpload(editor);
    await TinyUiActions.pWaitForUi(editor, '.tox-tab:contains("General")');
    await pAssertSrcTextValue(b64.split(',')[1]);
    closeDialog(editor);
  });

  it('TNY-6020: Image uploader test with upload error', async () => {
    const editor = hook.editor();
    editor.setContent('');
    editor.options.set('images_upload_handler', (_blobInfo) => Promise.reject('Error occurred'));
    TinyUiActions.clickOnToolbar(editor, 'button[aria-label="Insert/edit image"]');
    await TinyUiActions.pWaitForDialog(editor);
    TinyUiActions.clickOnUi(editor, '.tox-tab:contains("Upload")');
    await pTriggerUpload(editor);
    await TinyUiActions.pWaitForUi(editor, '.tox-alert-dialog');
    // TINY-7099: Ensure that the correct error message is displayed
    UiFinder.exists(SugarBody.body(), '.tox-alert-dialog .tox-dialog__body-content:contains("Error occurred")');
    TinyUiActions.clickOnUi(editor, '.tox-alert-dialog .tox-button:contains("OK")');
    UiFinder.notExists(SugarBody.body(), '.tox-alert-dialog');
    UiFinder.exists(SugarBody.body(), '.tox-dialog__body-nav-item--active:contains("Upload")');
    closeDialog(editor);
  });

  it('TBA: Image uploader test with automatic uploads disabled', async () => {
    const editor = hook.editor();
    editor.setContent('');
    editor.options.set('automatic_uploads', false);
    editor.options.set('images_upload_handler', (blobInfo) => Promise.resolve(blobInfo.base64()));
    TinyUiActions.clickOnToolbar(editor, 'button[aria-label="Insert/edit image"]');
    await TinyUiActions.pWaitForDialog(editor);
    TinyUiActions.clickOnUi(editor, '.tox-tab:contains("Upload")');
    await pTriggerUpload(editor);
    await TinyUiActions.pWaitForUi(editor, '.tox-tab:contains("General")');
    await pAssertSrcTextValueStartsWith('blob:');
    closeDialog(editor);
  });

  it('TINY-6224: Image uploader respects `images_file_types` setting', async () => {
    const editor = hook.editor();
    editor.setContent('');
    editor.options.set('images_upload_handler', (_blobInfo) => Promise.resolve('logo.svg'));
    editor.options.set('images_file_types', 'svg');
    TinyUiActions.clickOnToolbar(editor, 'button[aria-label="Insert/edit image"]');
    await TinyUiActions.pWaitForDialog(editor);
    TinyUiActions.clickOnUi(editor, '.tox-tab:contains("Upload")');
    await pTriggerUpload(editor, 'svg');
    await TinyUiActions.pWaitForUi(editor, '.tox-tab:contains("General")');
    await pAssertSrcTextValue('logo.svg');
    closeDialog(editor);
  });

  it('TINY-6622: Image uploader retains the file name/extension', async () => {
    const editor = hook.editor();
    editor.setContent('');
    editor.options.set('images_upload_handler', (blobInfo) => Promise.resolve(blobInfo.filename()));
    TinyUiActions.clickOnToolbar(editor, 'button[aria-label="Insert/edit image"]');
    await TinyUiActions.pWaitForDialog(editor);
    TinyUiActions.clickOnUi(editor, '.tox-tab:contains("Upload")');
    await pTriggerUpload(editor, 'jfif');
    await TinyUiActions.pWaitForUi(editor, '.tox-tab:contains("General")');
    await pAssertSrcTextValue('logo.jfif');
    closeDialog(editor);
  });
});
