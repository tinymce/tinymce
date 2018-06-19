import Element from 'ephox/sugar/api/node/Element';
import { document } from '@ephox/dom-globals';

export default function (type) {
  var dom = document.createElement(type);
  return Element.fromDom(dom);
};