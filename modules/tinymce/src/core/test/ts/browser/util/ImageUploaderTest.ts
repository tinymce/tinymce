import { Log, Pipeline, Chain } from '@ephox/agar';
import { Assert, UnitTest } from '@ephox/bedrock-client';
import { ApiChains, TinyLoader } from '@ephox/mcagar';
import { Arr } from '@ephox/katamari';
import ImageUploader, { UploadResult } from 'tinymce/core/api/util/ImageUploader';

import { BlobCache, BlobInfo } from 'tinymce/core/api/file/BlobCache';

import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.core.util.ImageUploaderTest', (success, failure) => {

  Theme();

  TinyLoader.setupLight((editor, onSuccess, onFailure) => {
    const cache = BlobCache();
    const blob = new Blob([ JSON.stringify({ hello: 'world' }) ]);

    const image1 = cache.create({ blob, base64: 'test' });

    const cUploadImages = (images: BlobInfo[], notifications: boolean) => Chain.async((_value, next, die) => {
      const uploader = ImageUploader(editor);
      uploader.upload(images, notifications).then(next, die);
    });

    const cAssertUploadResultSuccess = (expectedUrl: string, success: boolean) => Chain.op((uploadResults: UploadResult[]) => {
      Arr.each(uploadResults, (uploadResult) => {
        Assert.eq('Url is Image.png', expectedUrl, uploadResult.url);
        Assert.eq('Upload result status is true upon success', success, uploadResult.status);
      });
    });

    const cAssertUploadResultFailure = (expectedUrl: string, error: boolean) => Chain.op((uploadResults: UploadResult[]) => {
      Arr.each(uploadResults, (uploadResult) => {
        Assert.eq('Url is empty string upon failure', expectedUrl, '');
        Assert.eq('Upload result status is false upon failure', error, uploadResult.status);
      });
    });

    Pipeline.async({}, [
      Log.chainsAsStep('TINY-4601', 'Image upload success', [
        Chain.inject(editor),
        ApiChains.cSetSetting('images_upload_handler', (_blobInfo: BlobInfo[], success) => success('https://tiny.cloud/image.png')),
        cUploadImages([ image1 ], true),
        cAssertUploadResultSuccess('https://tiny.cloud/image.png', true)
      ]),
      Log.chainsAsStep('TINY-4601', 'Image upload failure', [
        Chain.inject(editor),
        ApiChains.cSetSetting('images_upload_handler', (_blobInfo: BlobInfo[], success, failure) => failure('')),
        cUploadImages([ image1 ], true),
        cAssertUploadResultFailure('', false)
      ])
    ], onSuccess, onFailure);
  }, {
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
