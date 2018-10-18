import { Future } from '@ephox/katamari';
import { FileReader } from '@ephox/sand';
import { Blob } from '@ephox/dom-globals';

const parse = function (blob: Blob) {
  return Future.nu(function (callback) {
    const fr = FileReader();
    fr.onload = function (e) {
      const data = e.target;
      callback(data.result);
    };
    fr.readAsText(blob);
  });
};

export const BlobError = {
  parse
};