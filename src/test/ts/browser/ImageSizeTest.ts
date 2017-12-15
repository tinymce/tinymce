import Assertion from 'ephox/imagetools/test/Assertion';
import Conversions from 'ephox/imagetools/util/Conversions';
import ImageSize from 'ephox/imagetools/util/ImageSize';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('ImageSizeTest', function() {
  var success = arguments[arguments.length - 2];
  var failure = arguments[arguments.length - 1];

  //   QUnit.asyncTest('getWidth', function() {
  //   imagetools.Conversions.blobToImage(testBlob).then(function(image) {
  //     QUnit.equal(ImageSize.getWidth(image), 320);
  //   }).then(QUnit.start);
  // });
  var canvas = document.createElement("canvas");
  canvas.width = 320;
  canvas.height = 200;

  Conversions.uriToBlob(canvas.toDataURL()).then(function (blob) {
    Conversions.blobToImage(blob).then(function (image) {
      var actualWidth = ImageSize.getWidth(image);
      var actualHeight = ImageSize.getHeight(image);

      Assertion.assertEq(320, actualWidth, 'Checking image width');
      Assertion.assertEq(200, actualHeight, 'Checking image height');
      success();
    }).catch(failure);
  });
});

