define(
  'ephox.imagetools.api.BlobConversions',

  [
    'ephox.imagetools.util.Conversions'
  ],

  function (Conversions) {
    return {
      // used outside
      blobToImage: Conversions.blobToImage,
      // used outside
      imageToBlob: Conversions.imageToBlob,
      // used outside
      blobToDataUri: Conversions.blobToDataUri,
      // used outside
      blobToBase64: Conversions.blobToBase64,
    };
  }
);