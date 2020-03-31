import { Blob, URL } from '@ephox/dom-globals';
import { Future, Futures, Id } from '@ephox/katamari';
import * as BlobConversions from '../api/BlobConversions';
import * as ResultConversions from '../api/ResultConversions';
import ImageAsset from './ImageAsset';
import { ImageAssetAdt } from './ImageAssetTypes';

/**
 * Converts a blob into a Future<ImageAsset>.
 */
const single = (img: Blob) => {
  const objurl = URL.createObjectURL(img);
  return singleWithUrl(img, objurl);
};

const singleWithUrl = (img: Blob, objurl: string) => Future.nu((callback: (data: ImageAssetAdt) => void) => {
  BlobConversions.blobToDataUri(img).then((datauri) => {
    const ir = ResultConversions.fromBlobAndUrlSync(img, datauri);
    const id = Id.generate('image');
    const asset = ImageAsset.blob(id, ir, objurl);
    callback(asset);
  });
});

/**
 * Converts a list of files into a list of ImageAssets. This is
 * asynchronous. The assets are passed to the callback
 * @param imgs the list of files
 * @param callback the callback function for the {BlobImageAsset[]}
 */

const multiple = (imgs: Blob[]): Future<ImageAssetAdt[]> =>
  // edge case: where a drop of a non-file takes place
  Futures.traverse(imgs, single);

export { multiple, single, singleWithUrl };
