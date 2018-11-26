/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Fun, Option } from '@ephox/katamari';
import { Element } from '@ephox/sugar';
import * as ElementType from '../dom/ElementType';
import NodeType from '../dom/NodeType';
import TreeWalker from '../api/dom/TreeWalker';

const firstNonWhiteSpaceNodeSibling = function (node) {
  while (node) {
    if (node.nodeType === 1 || (node.nodeType === 3 && node.data && /[\r\n\s]/.test(node.data))) {
      return node;
    }

    node = node.nextSibling;
  }
};

const moveToCaretPosition = function (editor, root) {
  // tslint:disable-next-line:prefer-const
  let walker, node, rng, lastNode = root, tempElm;
  const dom = editor.dom;
  const moveCaretBeforeOnEnterElementsMap = editor.schema.getMoveCaretBeforeOnEnterElements();

  if (!root) {
    return;
  }

  if (/^(LI|DT|DD)$/.test(root.nodeName)) {
    const firstChild = firstNonWhiteSpaceNodeSibling(root.firstChild);

    if (firstChild && /^(UL|OL|DL)$/.test(firstChild.nodeName)) {
      root.insertBefore(dom.doc.createTextNode('\u00a0'), root.firstChild);
    }
  }

  rng = dom.createRng();
  root.normalize();

  if (root.hasChildNodes()) {
    walker = new TreeWalker(root, root);

    while ((node = walker.current())) {
      if (NodeType.isText(node)) {
        rng.setStart(node, 0);
        rng.setEnd(node, 0);
        break;
      }

      if (moveCaretBeforeOnEnterElementsMap[node.nodeName.toLowerCase()]) {
        rng.setStartBefore(node);
        rng.setEndBefore(node);
        break;
      }

      lastNode = node;
      node = walker.next();
    }

    if (!node) {
      rng.setStart(lastNode, 0);
      rng.setEnd(lastNode, 0);
    }
  } else {
    if (NodeType.isBr(root)) {
      if (root.nextSibling && dom.isBlock(root.nextSibling)) {
        rng.setStartBefore(root);
        rng.setEndBefore(root);
      } else {
        rng.setStartAfter(root);
        rng.setEndAfter(root);
      }
    } else {
      rng.setStart(root, 0);
      rng.setEnd(root, 0);
    }
  }

  editor.selection.setRng(rng);

  // Remove tempElm created for old IE:s
  dom.remove(tempElm);
  editor.selection.scrollIntoView(root);
};

const getEditableRoot = function (dom, node) {
  const root = dom.getRoot();
  let parent, editableRoot;

  // Get all parents until we hit a non editable parent or the root
  parent = node;
  while (parent !== root && dom.getContentEditable(parent) !== 'false') {
    if (dom.getContentEditable(parent) === 'true') {
      editableRoot = parent;
    }

    parent = parent.parentNode;
  }

  return parent !== root ? editableRoot : root;
};

const getParentBlock = function (editor) {
  return Option.from(editor.dom.getParent(editor.selection.getStart(true), editor.dom.isBlock));
};

const getParentBlockName = function (editor) {
  return getParentBlock(editor).fold(
    Fun.constant(''),
    function (parentBlock) {
      return parentBlock.nodeName.toUpperCase();
    }
  );
};

const isListItemParentBlock = function (editor) {
  return getParentBlock(editor).filter(function (elm) {
    return ElementType.isListItem(Element.fromDom(elm));
  }).isSome();
};

export default {
  moveToCaretPosition,
  getEditableRoot,
  getParentBlock,
  getParentBlockName,
  isListItemParentBlock
};