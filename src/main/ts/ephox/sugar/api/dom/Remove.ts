import { Arr } from '@ephox/katamari';
import * as InsertAll from './InsertAll';
import * as Traverse from '../search/Traverse';
import Element from '../node/Element';
import { Node } from '@ephox/dom-globals';

const empty = function (element: Element) {
  // shortcut "empty node" trick. Requires IE 9.
  element.dom().textContent = '';

  // If the contents was a single empty text node, the above doesn't remove it. But, it's still faster in general
  // than removing every child node manually.
  // The following is (probably) safe for performance as 99.9% of the time the trick works and
  // Traverse.children will return an empty array.
  Arr.each(Traverse.children(element), function (rogue) {
    remove(rogue);
  });
};

const remove = function (element: Element) {
  const dom: Node = element.dom();
  if (dom.parentNode !== null) {
    dom.parentNode.removeChild(dom);
  }
};

const unwrap = function (wrapper: Element) {
  const children = Traverse.children(wrapper);
  if (children.length > 0) {
    InsertAll.before(wrapper, children);
  }
  remove(wrapper);
};

export {
  empty,
  remove,
  unwrap,
};