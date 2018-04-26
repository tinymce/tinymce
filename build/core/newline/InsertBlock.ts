/**
 * InsertBlock.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import Settings from '../api/Settings';
import * as CaretContainer from '../caret/CaretContainer';
import NodeType from '../dom/NodeType';
import TreeWalker from '../api/dom/TreeWalker';
import InsertLi from './InsertLi';
import NewLineUtils from './NewLineUtils';
import NormalizeRange from '../selection/NormalizeRange';
import Zwsp from '../text/Zwsp';
import Tools from '../api/util/Tools';
import { isCaretNode } from 'tinymce/core/fmt/FormatContainer';

const isEmptyAnchor = function (elm) {
  return elm && elm.nodeName === 'A' && Tools.trim(Zwsp.trim(elm.innerText || elm.textContent)).length === 0;
};

const isTableCell = function (node) {
  return node && /^(TD|TH|CAPTION)$/.test(node.nodeName);
};

const emptyBlock = function (elm) {
  elm.innerHTML = '<br data-mce-bogus="1">';
};

const containerAndSiblingName = function (container, nodeName) {
  return container.nodeName === nodeName || (container.previousSibling && container.previousSibling.nodeName === nodeName);
};

// Returns true if the block can be split into two blocks or not
const canSplitBlock = function (dom, node) {
  return node &&
    dom.isBlock(node) &&
    !/^(TD|TH|CAPTION|FORM)$/.test(node.nodeName) &&
    !/^(fixed|absolute)/i.test(node.style.position) &&
    dom.getContentEditable(node) !== 'true';
};

// Remove the first empty inline element of the block so this: <p><b><em></em></b>x</p> becomes this: <p>x</p>
const trimInlineElementsOnLeftSideOfBlock = function (dom, nonEmptyElementsMap, block) {
  let node = block;
  const firstChilds = [];
  let i;

  if (!node) {
    return;
  }

  // Find inner most first child ex: <p><i><b>*</b></i></p>
  while ((node = node.firstChild)) {
    if (dom.isBlock(node)) {
      return;
    }

    if (NodeType.isElement(node) && !nonEmptyElementsMap[node.nodeName.toLowerCase()]) {
      firstChilds.push(node);
    }
  }

  i = firstChilds.length;
  while (i--) {
    node = firstChilds[i];
    if (!node.hasChildNodes() || (node.firstChild === node.lastChild && node.firstChild.nodeValue === '')) {
      dom.remove(node);
    } else {
      if (isEmptyAnchor(node)) {
        dom.remove(node);
      }
    }
  }
};

const normalizeZwspOffset = function (start, container, offset) {
  if (NodeType.isText(container) === false) {
    return offset;
  } else if (start) {
    return offset === 1 && container.data.charAt(offset - 1) === Zwsp.ZWSP ? 0 : offset;
  } else {
    return offset === container.data.length - 1 && container.data.charAt(offset) === Zwsp.ZWSP ? container.data.length : offset;
  }
};

const includeZwspInRange = function (rng) {
  const newRng = rng.cloneRange();
  newRng.setStart(rng.startContainer, normalizeZwspOffset(true, rng.startContainer, rng.startOffset));
  newRng.setEnd(rng.endContainer, normalizeZwspOffset(false, rng.endContainer, rng.endOffset));
  return newRng;
};

// Trims any linebreaks at the beginning of node user for example when pressing enter in a PRE element
const trimLeadingLineBreaks = function (node) {
  do {
    if (NodeType.isText(node)) {
      node.nodeValue = node.nodeValue.replace(/^[\r\n]+/, '');
    }

    node = node.firstChild;
  } while (node);
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

const setForcedBlockAttrs = function (editor, node) {
  const forcedRootBlockName = Settings.getForcedRootBlock(editor);

  if (forcedRootBlockName && forcedRootBlockName.toLowerCase() === node.tagName.toLowerCase()) {
    editor.dom.setAttribs(node, Settings.getForcedRootBlockAttrs(editor));
  }
};

// Wraps any text nodes or inline elements in the specified forced root block name
const wrapSelfAndSiblingsInDefaultBlock = function (editor, newBlockName, rng, container, offset) {
  let newBlock, parentBlock, startNode, node, next, rootBlockName;
  const blockName = newBlockName || 'P';
  const dom = editor.dom, editableRoot = getEditableRoot(dom, container);

  // Not in a block element or in a table cell or caption
  parentBlock = dom.getParent(container, dom.isBlock);
  if (!parentBlock || !canSplitBlock(dom, parentBlock)) {
    parentBlock = parentBlock || editableRoot;

    if (parentBlock === editor.getBody() || isTableCell(parentBlock)) {
      rootBlockName = parentBlock.nodeName.toLowerCase();
    } else {
      rootBlockName = parentBlock.parentNode.nodeName.toLowerCase();
    }

    if (!parentBlock.hasChildNodes()) {
      newBlock = dom.create(blockName);
      setForcedBlockAttrs(editor, newBlock);
      parentBlock.appendChild(newBlock);
      rng.setStart(newBlock, 0);
      rng.setEnd(newBlock, 0);
      return newBlock;
    }

    // Find parent that is the first child of parentBlock
    node = container;
    while (node.parentNode !== parentBlock) {
      node = node.parentNode;
    }

    // Loop left to find start node start wrapping at
    while (node && !dom.isBlock(node)) {
      startNode = node;
      node = node.previousSibling;
    }

    if (startNode && editor.schema.isValidChild(rootBlockName, blockName.toLowerCase())) {
      newBlock = dom.create(blockName);
      setForcedBlockAttrs(editor, newBlock);
      startNode.parentNode.insertBefore(newBlock, startNode);

      // Start wrapping until we hit a block
      node = startNode;
      while (node && !dom.isBlock(node)) {
        next = node.nextSibling;
        newBlock.appendChild(node);
        node = next;
      }

      // Restore range to it's past location
      rng.setStart(container, offset);
      rng.setEnd(container, offset);
    }
  }

  return container;
};

// Adds a BR at the end of blocks that only contains an IMG or INPUT since
// these might be floated and then they won't expand the block
const addBrToBlockIfNeeded = function (dom, block) {
  let lastChild;

  // IE will render the blocks correctly other browsers needs a BR
  block.normalize(); // Remove empty text nodes that got left behind by the extract

  // Check if the block is empty or contains a floated last child
  lastChild = block.lastChild;
  if (!lastChild || (/^(left|right)$/gi.test(dom.getStyle(lastChild, 'float', true)))) {
    dom.add(block, 'br');
  }
};

const insert = function (editor, evt) {
  let tmpRng, editableRoot, container, offset, parentBlock, shiftKey;
  let newBlock, fragment, containerBlock, parentBlockName, containerBlockName, newBlockName, isAfterLastNodeInContainer;
  const dom = editor.dom;
  const schema = editor.schema, nonEmptyElementsMap = schema.getNonEmptyElements();
  const rng = editor.selection.getRng();

  // Creates a new block element by cloning the current one or creating a new one if the name is specified
  // This function will also copy any text formatting from the parent block and add it to the new one
  const createNewBlock = function (name?) {
    let node = container, block, clonedNode, caretNode;
    const textInlineElements = schema.getTextInlineElements();

    if (name || parentBlockName === 'TABLE' || parentBlockName === 'HR') {
      block = dom.create(name || newBlockName);
      setForcedBlockAttrs(editor, block);
    } else {
      block = parentBlock.cloneNode(false);
    }

    caretNode = block;

    if (Settings.shouldKeepStyles(editor) === false) {
      dom.setAttrib(block, 'style', null); // wipe out any styles that came over with the block
      dom.setAttrib(block, 'class', null);
    } else {
      // Clone any parent styles
      do {
        if (textInlineElements[node.nodeName]) {
          if (isCaretNode(node)) {
            continue;
          }

          clonedNode = node.cloneNode(false);
          dom.setAttrib(clonedNode, 'id', ''); // Remove ID since it needs to be document unique

          if (block.hasChildNodes()) {
            clonedNode.appendChild(block.firstChild);
            block.appendChild(clonedNode);
          } else {
            caretNode = clonedNode;
            block.appendChild(clonedNode);
          }
        }
      } while ((node = node.parentNode) && node !== editableRoot);
    }

    emptyBlock(caretNode);

    return block;
  };

  // Returns true/false if the caret is at the start/end of the parent block element
  const isCaretAtStartOrEndOfBlock = function (start?) {
    let walker, node, name, normalizedOffset;

    normalizedOffset = normalizeZwspOffset(start, container, offset);

    // Caret is in the middle of a text node like "a|b"
    if (NodeType.isText(container) && (start ? normalizedOffset > 0 : normalizedOffset < container.nodeValue.length)) {
      return false;
    }

    // If after the last element in block node edge case for #5091
    if (container.parentNode === parentBlock && isAfterLastNodeInContainer && !start) {
      return true;
    }

    // If the caret if before the first element in parentBlock
    if (start && NodeType.isElement(container) && container === parentBlock.firstChild) {
      return true;
    }

    // Caret can be before/after a table or a hr
    if (containerAndSiblingName(container, 'TABLE') || containerAndSiblingName(container, 'HR')) {
      return (isAfterLastNodeInContainer && !start) || (!isAfterLastNodeInContainer && start);
    }

    // Walk the DOM and look for text nodes or non empty elements
    walker = new TreeWalker(container, parentBlock);

    // If caret is in beginning or end of a text block then jump to the next/previous node
    if (NodeType.isText(container)) {
      if (start && normalizedOffset === 0) {
        walker.prev();
      } else if (!start && normalizedOffset === container.nodeValue.length) {
        walker.next();
      }
    }

    while ((node = walker.current())) {
      if (NodeType.isElement(node)) {
        // Ignore bogus elements
        if (!node.getAttribute('data-mce-bogus')) {
          // Keep empty elements like <img /> <input /> but not trailing br:s like <p>text|<br></p>
          name = node.nodeName.toLowerCase();
          if (nonEmptyElementsMap[name] && name !== 'br') {
            return false;
          }
        }
      } else if (NodeType.isText(node) && !/^[ \t\r\n]*$/.test(node.nodeValue)) {
        return false;
      }

      if (start) {
        walker.prev();
      } else {
        walker.next();
      }
    }

    return true;
  };

  const insertNewBlockAfter = function () {
    // If the caret is at the end of a header we produce a P tag after it similar to Word unless we are in a hgroup
    if (/^(H[1-6]|PRE|FIGURE)$/.test(parentBlockName) && containerBlockName !== 'HGROUP') {
      newBlock = createNewBlock(newBlockName);
    } else {
      newBlock = createNewBlock();
    }

    // Split the current container block element if enter is pressed inside an empty inner block element
    if (Settings.shouldEndContainerOnEmptyBlock(editor) && canSplitBlock(dom, containerBlock) && dom.isEmpty(parentBlock)) {
      // Split container block for example a BLOCKQUOTE at the current blockParent location for example a P
      newBlock = dom.split(containerBlock, parentBlock);
    } else {
      dom.insertAfter(newBlock, parentBlock);
    }

    NewLineUtils.moveToCaretPosition(editor, newBlock);
  };

  // Setup range items and newBlockName
  NormalizeRange.normalize(dom, rng).each(function (normRng) {
    rng.setStart(normRng.startContainer, normRng.startOffset);
    rng.setEnd(normRng.endContainer, normRng.endOffset);
  });

  container = rng.startContainer;
  offset = rng.startOffset;
  newBlockName = Settings.getForcedRootBlock(editor);
  shiftKey = evt.shiftKey;

  // Resolve node index
  if (NodeType.isElement(container) && container.hasChildNodes()) {
    isAfterLastNodeInContainer = offset > container.childNodes.length - 1;

    container = container.childNodes[Math.min(offset, container.childNodes.length - 1)] || container;
    if (isAfterLastNodeInContainer && NodeType.isText(container)) {
      offset = container.nodeValue.length;
    } else {
      offset = 0;
    }
  }

  // Get editable root node, normally the body element but sometimes a div or span
  editableRoot = getEditableRoot(dom, container);

  // If there is no editable root then enter is done inside a contentEditable false element
  if (!editableRoot) {
    return;
  }

  // Wrap the current node and it's sibling in a default block if it's needed.
  // for example this <td>text|<b>text2</b></td> will become this <td><p>text|<b>text2</p></b></td>
  // This won't happen if root blocks are disabled or the shiftKey is pressed
  if ((newBlockName && !shiftKey) || (!newBlockName && shiftKey)) {
    container = wrapSelfAndSiblingsInDefaultBlock(editor, newBlockName, rng, container, offset);
  }

  // Find parent block and setup empty block paddings
  parentBlock = dom.getParent(container, dom.isBlock);
  containerBlock = parentBlock ? dom.getParent(parentBlock.parentNode, dom.isBlock) : null;

  // Setup block names
  parentBlockName = parentBlock ? parentBlock.nodeName.toUpperCase() : ''; // IE < 9 & HTML5
  containerBlockName = containerBlock ? containerBlock.nodeName.toUpperCase() : ''; // IE < 9 & HTML5

  // Enter inside block contained within a LI then split or insert before/after LI
  if (containerBlockName === 'LI' && !evt.ctrlKey) {
    parentBlock = containerBlock;
    containerBlock = containerBlock.parentNode;
    parentBlockName = containerBlockName;
  }

  // Handle enter in list item
  if (/^(LI|DT|DD)$/.test(parentBlockName)) {
    // Handle enter inside an empty list item
    if (dom.isEmpty(parentBlock)) {
      InsertLi.insert(editor, createNewBlock, containerBlock, parentBlock, newBlockName);
      return;
    }
  }

  // If parent block is root then never insert new blocks
  if (newBlockName && parentBlock === editor.getBody()) {
    return;
  }

  // Default block name if it's not configured
  newBlockName = newBlockName || 'P';

  // Insert new block before/after the parent block depending on caret location
  if (CaretContainer.isCaretContainerBlock(parentBlock)) {
    newBlock = CaretContainer.showCaretContainerBlock(parentBlock);
    if (dom.isEmpty(parentBlock)) {
      emptyBlock(parentBlock);
    }
    NewLineUtils.moveToCaretPosition(editor, newBlock);
  } else if (isCaretAtStartOrEndOfBlock()) {
    insertNewBlockAfter();
  } else if (isCaretAtStartOrEndOfBlock(true)) {
    // Insert new block before
    newBlock = parentBlock.parentNode.insertBefore(createNewBlock(), parentBlock);
    NewLineUtils.moveToCaretPosition(editor, containerAndSiblingName(parentBlock, 'HR') ? newBlock : parentBlock);
  } else {
    // Extract after fragment and insert it after the current block
    tmpRng = includeZwspInRange(rng).cloneRange();
    tmpRng.setEndAfter(parentBlock);
    fragment = tmpRng.extractContents();
    trimLeadingLineBreaks(fragment);
    newBlock = fragment.firstChild;
    dom.insertAfter(fragment, parentBlock);
    trimInlineElementsOnLeftSideOfBlock(dom, nonEmptyElementsMap, newBlock);
    addBrToBlockIfNeeded(dom, parentBlock);

    if (dom.isEmpty(parentBlock)) {
      emptyBlock(parentBlock);
    }

    newBlock.normalize();

    // New block might become empty if it's <p><b>a |</b></p>
    if (dom.isEmpty(newBlock)) {
      dom.remove(newBlock);
      insertNewBlockAfter();
    } else {
      NewLineUtils.moveToCaretPosition(editor, newBlock);
    }
  }

  dom.setAttrib(newBlock, 'id', ''); // Remove ID since it needs to be document unique

  // Allow custom handling of new blocks
  editor.fire('NewBlock', { newBlock });
};

export default {
  insert
};