import { Log, Pipeline, Chain } from '@ephox/agar';
import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { ApiChains, TinyLoader } from '@ephox/mcagar';
import { BlobCache, BlobInfo } from 'tinymce/core/api/file/BlobCache';
import ImageUploader, { UploadResult } from 'tinymce/core/api/util/ImageUploader';

import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.core.util.ImageUploaderTest', (success, failure) => {

  Theme();

  TinyLoader.setupLight((editor, onSuccess, onFailure) => {
    const cache = BlobCache();
    const blob = new Blob([ JSON.stringify({ hello: 'world' }) ]);

    const image1 = cache.create({ blob, base64: 'test' });
    const image2 = cache.create({ blob, base64: 'test-two' });

    const cUploadImages = (images: BlobInfo[], openNotification: boolean) => Chain.async((_value, next, die) => {
      const uploader = ImageUploader(editor);
      uploader.upload(images, openNotification).then(next, die);
    });

    const cAssertUploadResultSuccess = (expectedLength: number, expectedUrl: string) => Chain.op((uploadResults: UploadResult[]) => {
      Assert.eq('Upload results length matches expected length', expectedLength, uploadResults.length);
      Arr.each(uploadResults, (uploadResult) => {
        Assert.eq('Url is Image.png', expectedUrl, uploadResult.url);
        Assert.eq('Upload result status is true upon success', true, uploadResult.status);
      });
    });

    const cAssertUploadResultFailure = (expectedLength: number, expectedUrl?: string, errorMsg?: string) => Chain.op((uploadResults: UploadResult[]) => {
      Assert.eq('Upload results length matches expected length', expectedLength, uploadResults.length);
      Arr.each(uploadResults, (uploadResult) => {
        Assert.eq('Url is empty string upon failure', expectedUrl, uploadResult.url);
        Assert.eq('Upload result status is false upon failure', false, uploadResult.status);
        Assert.eq('Upload result error message matches failure message', errorMsg, uploadResult.error.message);
      });
    });

    Pipeline.async({}, [
      Log.chainsAsStep('TINY-4601', 'Image upload success', [
        Chain.inject(editor),
        ApiChains.cSetSetting('images_upload_handler', (_blobInfo: BlobInfo, success) => success('https://tiny.cloud/image.png')),
        cUploadImages([ image1 ], true),
        cAssertUploadResultSuccess(1, 'https://tiny.cloud/image.png')
      ]),
      Log.chainsAsStep('TINY-4601', 'Multiple image upload success', [
        Chain.inject(editor),
        ApiChains.cSetSetting('images_upload_handler', (_blobInfo: BlobInfo, success) => success('https://tiny.cloud/image.png')),
        cUploadImages([ image1, image2 ], true),
        cAssertUploadResultSuccess(2, 'https://tiny.cloud/image.png')
      ]),
      Log.chainsAsStep('TINY-4601', 'Image upload failure', [
        Chain.inject(editor),
        ApiChains.cSetSetting('images_upload_handler', (_blobInfo: BlobInfo, _success, failure) => failure('Error msg')),
        cUploadImages([ image1 ], true),
        cAssertUploadResultFailure(1, '', 'Error msg')
      ]),
      Log.chainsAsStep('TINY-4601', 'Image upload failure for empty array', [
        Chain.inject(editor),
        ApiChains.cSetSetting('images_upload_handler', (_blobInfo: BlobInfo, _success, failure) => failure('Error msg')),
        cUploadImages([ ], true),
        cAssertUploadResultFailure(0)
      ]),
      Log.chainsAsStep('TINY-4601', 'Multiple image upload failure', [
        Chain.inject(editor),
        ApiChains.cSetSetting('images_upload_handler', (_blobInfo: BlobInfo, _success, failure) => failure('Error msg')),
        cUploadImages([ image1, image2 ], true),
        cAssertUploadResultFailure(2, '', 'Error msg')
      ]),
    ], onSuccess, onFailure);
  }, {
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
