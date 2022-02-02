import { Fun } from '@ephox/katamari';
import Promise from '@ephox/wrap-promise-polyfill';

import * as Canvas from './Canvas';
import * as Conversions from './Conversions';

export interface ImageResult {
  getType (): string;
  toBlob (): Promise<Blob>;
  toDataURL (): string;
  toBase64 (): string;
  toAdjustedBlob (type?: string, quality?: number): Promise<Blob>;
  toAdjustedDataURL (type?: string, quality?: number): Promise<string>;
  toAdjustedBase64 (type?: string, quality?: number): Promise<string>;
  toCanvas (): Promise<HTMLCanvasElement>;
}

const create = (getCanvas: Promise<HTMLCanvasElement>, blob: Blob, uri: string): ImageResult => {
  const initialType = blob.type;

  const getType = Fun.constant(initialType);

  const toBlob = () => {
    return Promise.resolve(blob);
  };

  const toDataURL = Fun.constant(uri);

  const toBase64 = () => {
    return uri.split(',')[1];
  };

  const toAdjustedBlob = (type: string, quality: number) => {
    return getCanvas.then((canvas) => {
      return Conversions.canvasToBlob(canvas, type, quality);
    });
  };

  const toAdjustedDataURL = (type?: string, quality?: number) => {
    return getCanvas.then((canvas) => {
      return Conversions.canvasToDataURL(canvas, type, quality);
    });
  };

  const toAdjustedBase64 = (type: string, quality: number) => {
    return toAdjustedDataURL(type, quality).then((dataurl) => {
      return dataurl.split(',')[1];
    });
  };

  const toCanvas = () => {
    return getCanvas.then(Canvas.clone);
  };

  return {
    getType,
    toBlob,
    toDataURL,
    toBase64,
    toAdjustedBlob,
    toAdjustedDataURL,
    toAdjustedBase64,
    toCanvas
  };
};

const fromBlob = (blob: Blob): Promise<ImageResult> => {
  return Conversions.blobToDataUri(blob).then((uri) => {
    return create(Conversions.blobToCanvas(blob), blob, uri);
  });
};

const fromCanvas = (canvas: HTMLCanvasElement, type?: string): Promise<ImageResult> => {
  return Conversions.canvasToBlob(canvas, type).then((blob) => {
    return create(Promise.resolve(canvas), blob, canvas.toDataURL());
  });
};

const fromImage = (image: HTMLImageElement): Promise<ImageResult> => {
  return Conversions.imageToBlob(image).then((blob) => {
    return fromBlob(blob);
  });
};

const fromBlobAndUrlSync = (blob: Blob, url: string): ImageResult => {
  return create(Conversions.blobToCanvas(blob), blob, url);
};

export {
  fromBlob,
  fromCanvas,
  fromImage,
  fromBlobAndUrlSync
};
