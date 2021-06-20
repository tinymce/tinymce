import { SugarElement } from '@ephox/sugar';

import { ImageResult } from '../util/ImageResult';

export interface BlobImageAsset {
  id: () => string;
  imageresult: () => ImageResult;
  objurl: () => string;
}

export interface UrlImageAsset {
  id: () => string;
  url: () => string;
  raw: () => SugarElement;
}

export type BlobCallback<T> = (id: string, imageresult: ImageResult, objurl: string) => T;
export type UrlCallback<T> = (id: string, url: string, raw: SugarElement) => T;

export interface ImageAssetAdt {
  fold: <T> (
    blob: BlobCallback<T>,
    url: UrlCallback<T>
  ) => T;
  match: <T> (branches: {
    blob: BlobCallback<T>;
    url: UrlCallback<T>;
  }) => T;
  log: (label: string) => void;
}

export interface ImageAssetConstructor {
  blob: BlobCallback<ImageAssetAdt>;
  url: UrlCallback<ImageAssetAdt>;
}
