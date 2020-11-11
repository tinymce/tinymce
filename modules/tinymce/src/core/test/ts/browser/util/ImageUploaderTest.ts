import { Log, Pipeline, Chain } from '@ephox/agar';
import { Assert, UnitTest } from '@ephox/bedrock-client';
import { TinyLoader } from '@ephox/mcagar';
import { Arr } from '@ephox/katamari';
import ImageUploader, { UploadResult } from 'tinymce/core/api/util/ImageUploader';

import { BlobCache, BlobInfo } from 'tinymce/core/api/file/BlobCache';

import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.core.util.ImageUploaderTest', (success, failure) => {

  Theme();

  TinyLoader.setupLight((editor, onSuccess, onFailure) => {
    const uploader = ImageUploader(editor);
    const cache = BlobCache();
    const blob = new Blob([ JSON.stringify({ hello: 'world' }) ]);

    const image1 = cache.create({ blob, base64: 'test' });

    const cUploadImages = (images: BlobInfo[], notifications: boolean) => Chain.async((_value, next, die) => {
      uploader.upload(images, notifications).then(next, die);
    });

    const cAssertUploadResult = (expectedLength: number) => Chain.op((uploadResults: UploadResult[]) => {
      Assert.eq('Number of results', expectedLength, uploadResults.length);
      Arr.each(uploadResults, (uploadResult) => {
        Assert.eq('Url is Image.png', 'Image.png', uploadResult.url);
        Assert.eq('Successful', true, uploadResult.status);
      });
    });

    Pipeline.async({}, [
      Log.chainsAsStep('TINY-4601', 'Check if image is uploaded successfuly', [
        cUploadImages([ image1 ], true),
        cAssertUploadResult(1)
      ])
    ], onSuccess, onFailure);
  }, {
    base_url: '/project/tinymce/js/tinymce',
    images_upload_handler: (_blobInfo, success, _failure, _progress) => {
      setTimeout(() => {
        success('Image.png');
      }, 50);
    }
  }, success, failure);
});
