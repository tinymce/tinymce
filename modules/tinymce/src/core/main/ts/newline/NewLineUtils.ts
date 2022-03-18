import { Fun, Optional, Unicode } from '@ephox/katamari';
import { SelectorExists, SugarElement } from '@ephox/sugar';

import DomTreeWalker from '../api/dom/TreeWalker';
import Editor from '../api/Editor';
import * as ElementType from '../dom/ElementType';
import * as NodeType from '../dom/NodeType';
import * as ScrollIntoView from '../dom/ScrollIntoView';

const firstNonWhiteSpaceNodeSibling = (node) => {
  while (node) {
    if (node.nodeType === 1 || (node.nodeType === 3 && node.data && /[\r\n\s]/.test(node.data))) {
      return node;
    }

    node = node.nextSibling;
  }
};

const moveToCaretPosition = (editor: Editor, root) => {
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
    const walker = new DomTreeWalker(root, root);

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

const getEditableRoot = (dom, node) => {
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

const getParentBlock = (editor: Editor) => {
  return Optional.from(editor.dom.getParent(editor.selection.getStart(true), editor.dom.isBlock));
};

const getParentBlockName = (editor: Editor) => {
  return getParentBlock(editor).fold(
    Fun.constant(''),
    (parentBlock) => {
      return parentBlock.nodeName.toUpperCase();
    }
  );
};

const isListItemParentBlock = (editor: Editor) => {
  return getParentBlock(editor).filter((elm) => {
    return ElementType.isListItem(SugarElement.fromDom(elm));
  }).isSome();
};

export {
  moveToCaretPosition,
  getEditableRoot,
  getParentBlock,
  getParentBlockName,
  isListItemParentBlock
};
