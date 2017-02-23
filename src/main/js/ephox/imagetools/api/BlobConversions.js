define(
  'ephox.imagetools.api.BlobConversions',
  [
    'ephox.imagetools.util.Conversions',
    'ephox.imagetools.util.ImageResult'
  ],
  function (Conversions, ImageResult) {
    var blobToImage = function (image) {
      return Conversions.blobToImage(image);
    };

    var imageToBlob = function (blob) {
      return Conversions.imageToBlob(blob);
    };

    var blobToDataUri = function (blob) {
      return Conversions.blobToDataUri(blob);
    };

    var blobToBase64 = function (blob) {
      return Conversions.blobToBase64(blob);
    };

    var blobToImageResult = function(blob) {
      return ImageResult.fromBlob(blob);
    };

    var dataUriToImageResult = function(uri) {
      return Conversions.uriToBlob(uri).then(ImageResult.fromBlob);
    };

    var imageToImageResult = function(image) {
      return ImageResult.fromImage(image);
    };

    var imageResultToBlob = function(ir, type, quality) {
      return ir.toBlob(type, quality);
    };

    var imageResultToBlobSync = function(ir, type, quality) {
      return Conversions.dataUriToBlobSync(ir.toDataURL(type, quality));
    };

    return {
      // used outside
      blobToImage: blobToImage,
      // used outside
      imageToBlob: imageToBlob,
      // used outside
      blobToDataUri: blobToDataUri,
      // used outside
      blobToBase64: blobToBase64,
      // used outside
      blobToImageResult: blobToImageResult,
      // used outside
      dataUriToImageResult: dataUriToImageResult,
      // used outside
      imageToImageResult: imageToImageResult,
      // used outside
      imageResultToBlob: imageResultToBlob,
      // just in case
      imageResultToBlobSync: imageResultToBlobSync
    };
  }
);