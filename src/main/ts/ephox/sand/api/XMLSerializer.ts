import Global from '../util/Global';
import { XMLSerializer, Node } from '@ephox/dom-globals';

/*
 * IE9 and above per
 * https://developer.mozilla.org/en/docs/XMLSerializer
 */
const xmlserializer = function () {
  const f: typeof XMLSerializer = Global.getOrDie('XMLSerializer');
  return new f();
};

const serializeToString = function (node: Node) {
  return xmlserializer().serializeToString(node);
};

export default {
  serializeToString
};