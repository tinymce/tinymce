define(
  'ephox.imagetools.api.ResultConversions',

  [
    'ephox.imagetools.util.ImageResult'
  ],

  function (ImageResult) {

    var blobToImageResult = function (blob) {
      return ImageResult.fromBlob(blob);
    };

    var fromBlobAndUrlSync = function (blob, uri) {
      // we have no reason to doubt the uri is valid
      return ImageResult.fromBlobAndUrlSync(blob, uri);
    };

    var imageToImageResult = function (image) {
      return ImageResult.fromImage(image);

    };

    var imageResultToBlob = function (ir, type, quality) {
      return ir.toBlob(type, quality);
    };

    var imageResultToOriginalBlob = function (ir) {
      // implementation detail - undefined type/quality returns original blob
      return ir.toBlob();
    };

    var imageResultToDataURL = function (ir, type, quality) {
      return ir.toDataURL(type, quality);
    };

    return {
      // used outside
      blobToImageResult: blobToImageResult,
      fromBlobAndUrlSync: fromBlobAndUrlSync,
      imageToImageResult: imageToImageResult,
      imageResultToBlob: imageResultToBlob,
      imageResultToOriginalBlob: imageResultToOriginalBlob,
      imageResultToDataURL: imageResultToDataURL
    };
  }
);
