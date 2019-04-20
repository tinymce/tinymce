import { Blob, HTMLImageElement } from '@ephox/dom-globals';
import * as ImageResult from '../util/ImageResult';

type ImageResultType = ImageResult.ImageResult;

const blobToImageResult = function (blob: Blob): Promise<ImageResultType> {
  return ImageResult.fromBlob(blob);
};

const fromBlobAndUrlSync = function (blob: Blob, uri: string): ImageResultType {
  // we have no reason to doubt the uri is valid
  return ImageResult.fromBlobAndUrlSync(blob, uri);
};

const imageToImageResult = function (image: HTMLImageElement): Promise<ImageResultType> {
  return ImageResult.fromImage(image);
};

const imageResultToBlob = function (ir: ImageResultType, type?: string, quality?: number): Promise<Blob> {
  // Shortcut to not lose the blob filename when we aren't editing the image
  if (type === undefined && quality === undefined) {
    return imageResultToOriginalBlob(ir);
  } else {
    return ir.toAdjustedBlob(type, quality);
  }
};

const imageResultToOriginalBlob = function (ir: ImageResultType): Promise<Blob> {
  return ir.toBlob();
};

const imageResultToDataURL = function (ir: ImageResultType): string {
  return ir.toDataURL();
};

export {
  // used outside
  blobToImageResult,
  fromBlobAndUrlSync,
  imageToImageResult,
  imageResultToBlob,
  imageResultToOriginalBlob,
  imageResultToDataURL
};