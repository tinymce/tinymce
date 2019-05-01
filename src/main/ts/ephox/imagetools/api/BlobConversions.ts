import { Blob, HTMLImageElement } from '@ephox/dom-globals';
import { Option } from '@ephox/katamari';
import * as Conversions from '../util/Conversions';

const blobToImage = function (blob: Blob): Promise<HTMLImageElement> {
  return Conversions.blobToImage(blob);
};

const imageToBlob = function (image: HTMLImageElement): Promise<Blob> {
  return Conversions.imageToBlob(image);
};

const blobToDataUri = function (blob: Blob): Promise<string> {
  return Conversions.blobToDataUri(blob);
};

const blobToBase64 = function (blob: Blob): Promise<string> {
  return Conversions.blobToBase64(blob);
};

const dataUriToBlobSync = function (uri: string): Option<Blob> {
  return Conversions.dataUriToBlobSync(uri);
};

const uriToBlob = function (uri: string): Option<Promise<Blob>> {
  return Option.from(Conversions.uriToBlob(uri));
};

export {
  // used outside
  blobToImage,
  imageToBlob,
  blobToDataUri,
  blobToBase64,
  dataUriToBlobSync,
  uriToBlob
};