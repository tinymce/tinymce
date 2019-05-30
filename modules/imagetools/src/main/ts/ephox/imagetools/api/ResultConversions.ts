import { Blob, HTMLImageElement } from '@ephox/dom-globals';
import { ImageResult, fromBlob, fromBlobAndUrlSync as fromBlobAndUrl, fromImage } from '../util/ImageResult';

const blobToImageResult = function (blob: Blob): Promise<ImageResult> {
  return fromBlob(blob);
};

const fromBlobAndUrlSync = function (blob: Blob, uri: string): ImageResult {
  // we have no reason to doubt the uri is valid
  return fromBlobAndUrl(blob, uri);
};

const imageToImageResult = function (image: HTMLImageElement): Promise<ImageResult> {
  return fromImage(image);
};

const imageResultToBlob = function (ir: ImageResult, type?: string, quality?: number): Promise<Blob> {
  // Shortcut to not lose the blob filename when we aren't editing the image
  if (type === undefined && quality === undefined) {
    return imageResultToOriginalBlob(ir);
  } else {
    return ir.toAdjustedBlob(type, quality);
  }
};

const imageResultToOriginalBlob = function (ir: ImageResult): Promise<Blob> {
  return ir.toBlob();
};

const imageResultToDataURL = function (ir: ImageResult): string {
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