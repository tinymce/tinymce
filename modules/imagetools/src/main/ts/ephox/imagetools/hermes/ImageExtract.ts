import { Blob } from '@ephox/dom-globals';
import { Future, Futures, Id } from '@ephox/katamari';
import { URL } from '@ephox/sand';
import * as BlobConversions from '../api/BlobConversions';
import * as ResultConversions from '../api/ResultConversions';
import ImageAsset from './ImageAsset';

/**
 * Converts a blob into a Future<ImageAsset>.
 */
const single = (blob: Blob) => {
  const objurl = URL.createObjectURL(blob);
  return singleWithUrl(blob, objurl);
};

const singleWithUrl = (blob: Blob, objurl: string) => {
  return Future.nu((callback) => {
    BlobConversions.blobToDataUri(blob).then((datauri) => {
      const ir = ResultConversions.fromBlobAndUrlSync(blob, datauri);
      const id = Id.generate('image');
      const asset = ImageAsset.blob(id, ir, objurl);
      callback(asset);
    });
  });
};

/**
 * Converts a list of files into a list of ImageAssets. This is
 * asynchronous. The assets are passed to the callback
 * @param files the list of files
 * @param callback the callback function for the {BlobImageAsset[]}
 */

const multiple = (files: Blob[]) => {
  // edge case: where a drop of a non-file takes place
  return files.length === 0 ? Future.pure([]) :  Futures.mapM(files, single);
};

export default { multiple, single, singleWithUrl };