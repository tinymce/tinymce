/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Fun, Option, Unicode } from '@ephox/katamari';
import { Element } from '@ephox/sugar';
import TreeWalker from '../api/dom/TreeWalker';
import Editor from '../api/Editor';
import * as ElementType from '../dom/ElementType';
import * as NodeType from '../dom/NodeType';
import * as ScrollIntoView from '../dom/ScrollIntoView';

const firstNonWhiteSpaceNodeSibling = function (node) {
  while (node) {
    if (node.nodeType === 1 || (node.nodeType === 3 && node.data && /[\r\n\s]/.test(node.data))) {
      return node;
    }

    node = node.nextSibling;
  }
};

const moveToCaretPosition = function (editor: Editor, root) {
  let node, lastNode = root;
  const dom = editor.dom;
  const moveCaretBeforeOnEnterElementsMap = editor.schema.getMoveCaretBeforeOnEnterElements();

  if (!root) {
    return;
  }

  if (/^(LI|DT|DD)$/.test(root.nodeName)) {
    const firstChild = firstNonWhiteSpaceNodeSibling(root.firstChild);

    if (firstChild && /^(UL|OL|DL)$/.test(firstChild.nodeName)) {
      root.insertBefore(dom.doc.createTextNode(Unicode.nbsp), root.firstChild);
    }
  }

  const rng = dom.createRng();
  root.normalize();

  if (root.hasChildNodes()) {
    const walker = new TreeWalker(root, root);

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
  ScrollIntoView.scrollRangeIntoView(editor, rng);
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

const getParentBlock = function (editor: Editor) {
  return Option.from(editor.dom.getParent(editor.selection.getStart(true), editor.dom.isBlock));
};

const getParentBlockName = function (editor: Editor) {
  return getParentBlock(editor).fold(
    Fun.constant(''),
    function (parentBlock) {
      return parentBlock.nodeName.toUpperCase();
    }
  );
};

const isListItemParentBlock = function (editor: Editor) {
  return getParentBlock(editor).filter(function (elm) {
    return ElementType.isListItem(Element.fromDom(elm));
  }).isSome();
};

export {
  moveToCaretPosition,
  getEditableRoot,
  getParentBlock,
  getParentBlockName,
  isListItemParentBlock
};
