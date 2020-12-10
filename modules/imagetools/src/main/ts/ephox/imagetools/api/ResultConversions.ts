import { fromBlob, fromBlobAndUrlSync as fromBlobAndUrl, fromImage, ImageResult } from '../util/ImageResult';

const blobToImageResult = (blob: Blob): Promise<ImageResult> => {
  return fromBlob(blob);
};

const fromBlobAndUrlSync = (blob: Blob, uri: string): ImageResult => {
  // we have no reason to doubt the uri is valid
  return fromBlobAndUrl(blob, uri);
};

const imageToImageResult = (image: HTMLImageElement): Promise<ImageResult> => {
  return fromImage(image);
};

const imageResultToBlob = (ir: ImageResult, type?: string, quality?: number): Promise<Blob> => {
  // Shortcut to not lose the blob filename when we aren't editing the image
  if (type === undefined && quality === undefined) {
    return imageResultToOriginalBlob(ir);
  } else {
    return ir.toAdjustedBlob(type, quality);
  }
};

const imageResultToOriginalBlob = (ir: ImageResult): Promise<Blob> => {
  return ir.toBlob();
};

const imageResultToDataURL = (ir: ImageResult): string => {
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
