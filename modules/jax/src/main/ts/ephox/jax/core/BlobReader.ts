import { Future } from '@ephox/katamari';

const readBlobAsText = (blob: Blob): Future<string> => Future.nu((callback) => {
  const fr = new FileReader();
  fr.onload = (e) => {
    const data = e.target ? e.target.result as string : '';
    callback(data);
  };
  fr.readAsText(blob);
});

export {
  readBlobAsText
};
