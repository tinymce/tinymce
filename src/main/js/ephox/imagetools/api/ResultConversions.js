define(
  'ephox.imagetools.api.ResultConversions',

  [
    'ephox.imagetools.util.Conversions',
    'ephox.imagetools.util.ImageResult'
  ],

  function (Conversions, ImageResult) {

    var blobToImageResult = function (blob) {
      return ImageResult.fromBlob(blob);
    };

    var dataUriToImageResult = function (uri) {
      return Conversions.uriToBlob(uri).then(ImageResult.fromBlob);
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
      dataUriToImageResult: dataUriToImageResult,
      imageToImageResult: imageToImageResult,
      imageResultToBlob: imageResultToBlob,
      imageResultToOriginalBlob: imageResultToOriginalBlob,
      imageResultToDataURL: imageResultToDataURL
    };
  }
);
