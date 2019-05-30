import Global from '../util/Global';
import { Blob, BlobPropertyBag } from '@ephox/dom-globals';

export default function (parts?: any[], properties?: BlobPropertyBag) {
  const f: typeof Blob = Global.getOrDie('Blob');
  return new f(parts, properties);
};