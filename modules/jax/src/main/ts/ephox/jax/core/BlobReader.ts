import { Future } from '@ephox/katamari';
import { FileReader, Blob } from '@ephox/dom-globals';

const readBlobAsText = (blob: Blob) => Future.nu((callback) => {
  const fr = new FileReader();
  fr.onload = (e) => {
    const data = e.target ? e.target.result : new Blob([]);
    callback(data);
  };
  fr.readAsText(blob);
});

export {
  readBlobAsText
};
