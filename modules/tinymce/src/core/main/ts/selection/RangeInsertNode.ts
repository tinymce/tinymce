/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Range, Node, DocumentFragment } from '@ephox/dom-globals';
import DOMUtils from '../api/dom/DOMUtils';
import * as NodeType from '../dom/NodeType';
import { Option } from '@ephox/katamari';

const trimEmptyTextNode = (dom: DOMUtils, node: Node) => {
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
  const firstChild = Option.from(frag.firstChild);
  const lastChild = Option.from(frag.lastChild);

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
