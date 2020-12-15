import { UnitTest } from '@ephox/bedrock-client';
import * as Assertion from 'ephox/imagetools/test/Assertion';
import * as Conversions from 'ephox/imagetools/util/Conversions';
import * as ImageSize from 'ephox/imagetools/util/ImageSize';

UnitTest.asynctest('ImageSizeTest', (success, failure) => {

  //   QUnit.asyncTest('getWidth', function() {
  //   imagetools.Conversions.blobToImage(testBlob).then(function(image) {
  //     QUnit.equal(ImageSize.getWidth(image), 320);
  //   }).then(QUnit.start);
  // });
  const canvas = document.createElement('canvas');
  canvas.width = 320;
  canvas.height = 200;

  const uriToBlobPromise = Conversions.uriToBlob(canvas.toDataURL()) as Promise<Blob>;
  uriToBlobPromise.then((blob) => {
    Conversions.blobToImage(blob).then((image) => {
      const actualWidth = ImageSize.getWidth(image);
      const actualHeight = ImageSize.getHeight(image);

      Assertion.assertEq(320, actualWidth, 'Checking image width');
      Assertion.assertEq(200, actualHeight, 'Checking image height');
      success();
    }).catch(failure);
  });
});
