import { ImageResult } from '../util/ImageResult';
import { Element } from '@ephox/sugar';

export interface BlobImageAsset {
  id: () => string;
  imageresult: () => ImageResult;
  objurl: () => string;
}

export interface UrlImageAsset {
  id: () => string;
  url: () => string;
  raw: () => Element;
}

export type BlobCallback<T> = (id: string, imageresult: ImageResult, objurl: string) => T;
export type UrlCallback<T> = (id: string, url: string, raw: Element) => T;

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