import Conversions from '../util/Conversions';
import { Option } from '@ephox/katamari';

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

var uriToBlob = function (uri) {
  return Option.from(Conversions.uriToBlob(uri));
};

export default <any> {
  // used outside
  blobToImage,
  imageToBlob,
  blobToDataUri,
  blobToBase64,
  dataUriToBlobSync,
  uriToBlob
};