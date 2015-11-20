asynctest(
  'ImageSizeTest',

  [
    'ephox/imagetools/test/Assertion',
    'ephox/imagetools/util/Conversions',
    'ephox/imagetools/util/ImageSize'
  ],

  function (Assertion, Conversions, ImageSize) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    //   QUnit.asyncTest('getWidth', function() {
    //   imagetools.Conversions.blobToImage(testBlob).then(function(image) {
    //     QUnit.equal(ImageSize.getWidth(image), 320);
    //   }).then(QUnit.start);
    // });
    canvas = document.createElement("canvas");
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
  }
);