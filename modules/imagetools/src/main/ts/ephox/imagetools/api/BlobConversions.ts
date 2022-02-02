import { Optional } from '@ephox/katamari';

import * as Conversions from '../util/Conversions';

const blobToImage = (blob: Blob): Promise<HTMLImageElement> => {
  return Conversions.blobToImage(blob);
};

const imageToBlob = (image: HTMLImageElement): Promise<Blob> => {
  return Conversions.imageToBlob(image);
};

const blobToDataUri = (blob: Blob): Promise<string> => {
  return Conversions.blobToDataUri(blob);
};

const blobToBase64 = (blob: Blob): Promise<string> => {
  return Conversions.blobToBase64(blob);
};

const dataUriToBlobSync = (uri: string): Optional<Blob> => {
  return Conversions.dataUriToBlobSync(uri);
};

const uriToBlob = (uri: string): Optional<Promise<Blob>> => {
  return Optional.from(Conversions.uriToBlob(uri));
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
