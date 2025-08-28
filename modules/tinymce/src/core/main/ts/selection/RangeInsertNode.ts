import { Optional } from '@ephox/katamari';

import DOMUtils from '../api/dom/DOMUtils';
import * as NodeType from '../dom/NodeType';

const trimEmptyTextNode = (dom: DOMUtils, node: Node | null) => {
  if (NodeType.isText(node) && node.data.length === 0) {
    dom.remove(node);
  }
};

const insertNode = (dom: DOMUtils, rng: Range, node: Node) => {
  rng.insertNode(node);
  trimEmptyTextNode(dom, node.previousSibling);
  trimEmptyTextNode(dom, node.nextSibling);
};

const insertFragment = (dom: DOMUtils, rng: Range, frag: DocumentFragment) => {
  const firstChild = Optional.from(frag.firstChild);
  const lastChild = Optional.from(frag.lastChild);

  rng.insertNode(frag);

  firstChild.each((child) => trimEmptyTextNode(dom, child.previousSibling));
  lastChild.each((child) => trimEmptyTextNode(dom, child.nextSibling));
};

// Wrapper to Range.insertNode which removes any empty text nodes created in the process.
// Doesn't merge adjacent text nodes - this is according to the DOM spec.
const rangeInsertNode = (dom: DOMUtils, rng: Range, node: Node | DocumentFragment): void => {
  if (NodeType.isDocumentFragment(node)) {
    insertFragment(dom, rng, node);
  } else {
    insertNode(dom, rng, node);
  }
};

export {
  rangeInsertNode
};
