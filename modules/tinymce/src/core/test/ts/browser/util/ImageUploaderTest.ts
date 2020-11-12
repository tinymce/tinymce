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

    const cAssertUploadResultSuccess = (expectedLength: number, url: string) => Chain.op((uploadResults: UploadResult[]) => {
      Assert.eq('Number of results', expectedLength, uploadResults.length);
      Arr.each(uploadResults, (uploadResult) => {
        Assert.eq('Url is Image.png', url, uploadResult.url);
        Assert.eq('Successful', true, uploadResult.status);
      });
    });

    const cAssertUploadResultFailure = (expectedLength: number, url: string) => Chain.op((uploadResults: UploadResult[]) => {
      Assert.eq('Number of results', expectedLength, 0);
      Arr.each(uploadResults, (uploadResult) => {
        Assert.eq('Url is ""', url, '');
        Assert.eq('Failure', false, uploadResult.status);
      });
    });

    Pipeline.async({}, [
      Log.chainsAsStep('TINY-4601', 'Check if image is uploaded successfully', [
        Chain.inject(editor),
        ApiChains.cSetSetting('images_upload_handler', (_blobInfo: BlobInfo[], success) => success('Image.png')),
        cUploadImages([ image1 ], true),
        cAssertUploadResultSuccess(1, 'Image.png')
      ]),
      Log.chainsAsStep('TINY-4601', 'Check if image upload have failed', [
        Chain.inject(editor),
        ApiChains.cSetSetting('images_upload_handler', (_blobInfo: BlobInfo[], success, failure) => failure('Error')),
        cUploadImages([ image1 ], true),
        cAssertUploadResultFailure(0, '')
      ])
    ], onSuccess, onFailure);
  }, {
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
