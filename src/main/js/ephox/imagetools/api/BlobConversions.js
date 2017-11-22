define(
  'ephox.imagetools.api.BlobConversions',
  [
    'ephox.imagetools.util.Conversions'
  ],
  function (Conversions) {
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

    var dataUriToBlobSync = function (uri) {
      return Conversions.dataUriToBlobSync(uri);
    };

    return {
      // used outside
      blobToImage: blobToImage,
      imageToBlob: imageToBlob,
      blobToDataUri: blobToDataUri,
      blobToBase64: blobToBase64,
      dataUriToBlobSync: dataUriToBlobSync
    };
  }
);