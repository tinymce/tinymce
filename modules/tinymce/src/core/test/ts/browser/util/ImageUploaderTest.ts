import { before, describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import { BlobCache, BlobInfo } from 'tinymce/core/api/file/BlobCache';
import ImageUploader, { UploadResult } from 'tinymce/core/api/util/ImageUploader';

describe('browser.tinymce.core.util.ImageUploaderTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce'
  }, []);
  let image1: BlobInfo;
  let image2: BlobInfo;

  before(() => {
    const cache = BlobCache();
    const blob = new Blob([ JSON.stringify({ hello: 'world' }) ]);

    image1 = cache.create({ blob, base64: 'test' });
    image2 = cache.create({ blob, base64: 'test-two' });
  });

  const uploadImages = (editor: Editor, images: BlobInfo[], openNotification: boolean) => {
    const uploader = ImageUploader(editor);
    return uploader.upload(images, openNotification);
  };

  const assertUploadResultSuccess = (uploadResults: UploadResult[], expectedLength: number, expectedUrl: string) => {
    assert.lengthOf(uploadResults, expectedLength, 'Upload results length matches expected length');
    Arr.each(uploadResults, (uploadResult) => {
      assert.equal(uploadResult.url, expectedUrl, 'Url is Image.png');
      assert.isTrue(uploadResult.status, 'Upload result status is true upon success');
    });
  };

  const assertUploadResultFailure = (uploadResults: UploadResult[], expectedLength: number, errorMsg: string) => {
    assert.lengthOf(uploadResults, expectedLength, 'Upload results length matches expected length');
    Arr.each(uploadResults, (uploadResult) => {
      assert.isFalse(uploadResult.status, 'Upload result status is false upon failure');
      assert.equal(uploadResult.url, '', 'Url is empty string upon failure');
      assert.equal(uploadResult.error?.message, errorMsg, 'Upload result error message matches failure message');
    });
  };

  it('TINY-4601: Image upload success', async () => {
    const editor = hook.editor();
    editor.options.set('images_upload_handler', (_blobInfo: BlobInfo) => Promise.resolve('https://tiny.cloud/image.png'));
    const uploadResults = await uploadImages(editor, [ image1 ], true);
    assertUploadResultSuccess(uploadResults, 1, 'https://tiny.cloud/image.png');
  });

  it('TINY-4601: Multiple image upload success', async () => {
    const editor = hook.editor();
    editor.options.set('images_upload_handler', (_blobInfo: BlobInfo) => Promise.resolve('https://tiny.cloud/image.png'));
    const uploadResults = await uploadImages(editor, [ image1, image2 ], true);
    assertUploadResultSuccess(uploadResults, 2, 'https://tiny.cloud/image.png');
  });

  it('TINY-4601: Image upload failure', async () => {
    const editor = hook.editor();
    editor.options.set('images_upload_handler', (_blobInfo: BlobInfo) => Promise.reject('Error msg'));
    const uploadResults = await uploadImages(editor, [ image1 ], true);
    assertUploadResultFailure(uploadResults, 1, 'Error msg');
  });

  it('TINY-4601: Image upload failure for empty array', async () => {
    const editor = hook.editor();
    editor.options.set('images_upload_handler', (_blobInfo: BlobInfo) => Promise.reject('Error msg'));
    const uploadResults = await uploadImages(editor, [], true);
    assertUploadResultFailure(uploadResults, 0, 'Error msg');
  });

  it('TINY-4601: Multiple image upload failure', async () => {
    const editor = hook.editor();
    editor.options.set('images_upload_handler', (_blobInfo: BlobInfo) => Promise.reject('Error msg'));
    const uploadResults = await uploadImages(editor, [ image1, image2 ], true);
    assertUploadResultFailure(uploadResults, 2, 'Error msg');
  });
});
