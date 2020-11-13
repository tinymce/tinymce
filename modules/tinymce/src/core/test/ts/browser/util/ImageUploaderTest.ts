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
        Assert.eq('Upload result status is true upon success', true, uploadResult.status);
      });
    });

    const cAssertUploadResultFailure = (expectedLength: number, url: string) => Chain.op((uploadResults: UploadResult[]) => {
      Assert.eq('Number of results', expectedLength, uploadResults[0].url.length);
      Arr.each(uploadResults, (uploadResult) => {
        Assert.eq('Url is empty string upon failure', url, '');
        Assert.eq('Upload result status is false upon failure', false, uploadResult.status);
      });
    });

    Pipeline.async({}, [
      Log.chainsAsStep('TINY-4601', 'Image upload success', [
        Chain.inject(editor),
        ApiChains.cSetSetting('images_upload_handler', (_blobInfo: BlobInfo[], success) => success('https://tiny.cloud/image.png')),
        cUploadImages([ image1 ], true),
        cAssertUploadResultSuccess(1, 'https://tiny.cloud/image.png')
      ]),
      Log.chainsAsStep('TINY-4601', 'Image upload failure', [
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
