import { Blob, File } from '@ephox/dom-globals';
import { Future, Futures, Id } from '@ephox/katamari';
import { URL } from '@ephox/sand';
import * as BlobConversions from '../api/BlobConversions';
import * as ResultConversions from '../api/ResultConversions';
import ImageAsset from './ImageAsset';
import { ImageAssetAdt } from './ImageAssetTypes';

// Files and Blob have the same API and we seem to pass both in at different points
type Image = File | Blob;

/**
 * Converts a blob into a Future<ImageAsset>.
 */
const single = (img: Image) => {
  const objurl = URL.createObjectURL(img);
  return singleWithUrl(img, objurl);
};

const singleWithUrl = (img: Image, objurl: string) => {
  return Future.nu((callback: (data: ImageAssetAdt) => void) => {
    BlobConversions.blobToDataUri(img).then((datauri) => {
      const ir = ResultConversions.fromBlobAndUrlSync(img, datauri);
      const id = Id.generate('image');
      const asset = ImageAsset.blob(id, ir, objurl);
      callback(asset);
    });
  });
};

/**
 * Converts a list of files into a list of ImageAssets. This is
 * asynchronous. The assets are passed to the callback
 * @param img the list of files
 * @param callback the callback function for the {BlobImageAsset[]}
 */

const multiple = (img: Image[]): Future<ImageAssetAdt[]> => {
  // edge case: where a drop of a non-file takes place
  return img.length === 0 ? Future.pure([]) :  Futures.mapM(img, single);
};

export { multiple, single, singleWithUrl };