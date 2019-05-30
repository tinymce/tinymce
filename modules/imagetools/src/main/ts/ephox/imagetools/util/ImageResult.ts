import { Blob, HTMLCanvasElement, HTMLImageElement } from '@ephox/dom-globals';
import { Fun } from '@ephox/katamari';
import * as Canvas from './Canvas';
import * as Conversions from './Conversions';
import { Promise } from './Promise';

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

function create(getCanvas: Promise<HTMLCanvasElement>, blob: Blob, uri: string): ImageResult {
  const initialType = blob.type;

  const getType = Fun.constant(initialType);

  function toBlob() {
    return Promise.resolve(blob);
  }

  function toDataURL() {
    return uri;
  }

  function toBase64() {
    return uri.split(',')[1];
  }

  function toAdjustedBlob(type: string, quality: number) {
    return getCanvas.then(function (canvas) {
      return Conversions.canvasToBlob(canvas, type, quality);
    });
  }

  function toAdjustedDataURL(type?: string, quality?: number) {
    return getCanvas.then(function (canvas) {
      return Conversions.canvasToDataURL(canvas, type, quality);
    });
  }

  function toAdjustedBase64(type: string, quality: number) {
    return toAdjustedDataURL(type, quality).then(function (dataurl) {
      return dataurl.split(',')[1];
    });
  }

  function toCanvas() {
    return getCanvas.then(Canvas.clone);
  }

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
}

function fromBlob(blob: Blob): Promise<ImageResult> {
  return Conversions.blobToDataUri(blob).then(function (uri) {
    return create(Conversions.blobToCanvas(blob), blob, uri);
  });
}

function fromCanvas(canvas: HTMLCanvasElement, type?: string): Promise<ImageResult> {
  return Conversions.canvasToBlob(canvas, type).then(function (blob) {
    return create(Promise.resolve(canvas), blob, canvas.toDataURL());
  });
}

function fromImage(image: HTMLImageElement): Promise<ImageResult> {
  return Conversions.imageToBlob(image).then(function (blob) {
    return fromBlob(blob);
  });
}

const fromBlobAndUrlSync = function (blob: Blob, url: string): ImageResult {
  return create(Conversions.blobToCanvas(blob), blob, url);
};

export {
  fromBlob,
  fromCanvas,
  fromImage,
  fromBlobAndUrlSync
};