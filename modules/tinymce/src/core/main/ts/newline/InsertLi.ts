/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import NodeType from '../dom/NodeType';
import NewLineUtils from './NewLineUtils';
import Editor from '../api/Editor';

const hasFirstChild = function (elm, name) {
  return elm.firstChild && elm.firstChild.nodeName === name;
};

const hasParent = function (elm, parentName) {
  return elm && elm.parentNode && elm.parentNode.nodeName === parentName;
};

const isListBlock = function (elm) {
  return elm && /^(OL|UL|LI)$/.test(elm.nodeName);
};

const isNestedList = function (elm) {
  return isListBlock(elm) && isListBlock(elm.parentNode);
};

const getContainerBlock = function (containerBlock) {
  const containerBlockParent = containerBlock.parentNode;

  if (/^(LI|DT|DD)$/.test(containerBlockParent.nodeName)) {
    return containerBlockParent;
  }

  return containerBlock;
};

const isFirstOrLastLi = function (containerBlock, parentBlock, first) {
  let node = containerBlock[first ? 'firstChild' : 'lastChild'];

  // Find first/last element since there might be whitespace there
  while (node) {
    if (NodeType.isElement(node)) {
      break;
    }

    node = node[first ? 'nextSibling' : 'previousSibling'];
  }

  return node === parentBlock;
};

// Inserts a block or br before/after or in the middle of a split list of the LI is empty
const insert = function (editor: Editor, createNewBlock, containerBlock, parentBlock, newBlockName) {
  const dom = editor.dom;
  const rng = editor.selection.getRng();

  if (containerBlock === editor.getBody()) {
    return;
  }

  if (isNestedList(containerBlock)) {
    newBlockName = 'LI';
  }

  let newBlock = newBlockName ? createNewBlock(newBlockName) : dom.create('BR');

  if (isFirstOrLastLi(containerBlock, parentBlock, true) && isFirstOrLastLi(containerBlock, parentBlock, false)) {
    if (hasParent(containerBlock, 'LI')) {
      // Nested list is inside a LI
      dom.insertAfter(newBlock, getContainerBlock(containerBlock));
    } else {
      // Is first and last list item then replace the OL/UL with a text block
      dom.replace(newBlock, containerBlock);
    }
  } else if (isFirstOrLastLi(containerBlock, parentBlock, true)) {
    if (hasParent(containerBlock, 'LI')) {
      // List nested in an LI then move the list to a new sibling LI
      dom.insertAfter(newBlock, getContainerBlock(containerBlock));
      newBlock.appendChild(dom.doc.createTextNode(' ')); // Needed for IE so the caret can be placed
      newBlock.appendChild(containerBlock);
    } else {
      // First LI in list then remove LI and add text block before list
      containerBlock.parentNode.insertBefore(newBlock, containerBlock);
    }
  } else if (isFirstOrLastLi(containerBlock, parentBlock, false)) {
    // Last LI in list then remove LI and add text block after list
    dom.insertAfter(newBlock, getContainerBlock(containerBlock));
  } else {
    // Middle LI in list the split the list and insert a text block in the middle
    // Extract after fragment and insert it after the current block
    containerBlock = getContainerBlock(containerBlock);
    const tmpRng = rng.cloneRange();
    tmpRng.setStartAfter(parentBlock);
    tmpRng.setEndAfter(containerBlock);
    const fragment = tmpRng.extractContents();

    if (newBlockName === 'LI' && hasFirstChild(fragment, 'LI')) {
      newBlock = fragment.firstChild;
      dom.insertAfter(fragment, containerBlock);
    } else {
      dom.insertAfter(fragment, containerBlock);
      dom.insertAfter(newBlock, containerBlock);
    }
  }

  dom.remove(parentBlock);
  NewLineUtils.moveToCaretPosition(editor, newBlock);
};

export default {
  insert
};