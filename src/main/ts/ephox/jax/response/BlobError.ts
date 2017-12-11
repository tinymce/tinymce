import { Future } from '@ephox/katamari';
import { FileReader } from '@ephox/sand';



export default <any> function (blob) {
  return Future.nu(function (callback) {
    var fr = FileReader();
    fr.onload = function (e) {
      var data = e.target;
      callback(data.result);
    };
    fr.readAsText(blob);
  });
};