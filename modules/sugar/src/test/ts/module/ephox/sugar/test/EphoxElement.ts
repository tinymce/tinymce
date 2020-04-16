import { document } from '@ephox/dom-globals';
import Element from 'ephox/sugar/api/node/Element';

export default (type: string) => {
  const dom = document.createElement(type);
  return Element.fromDom(dom);
};
