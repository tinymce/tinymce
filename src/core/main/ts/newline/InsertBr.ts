/**
 * InsertBr.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { Fun } from '@ephox/katamari';
import { Insert, Element } from '@ephox/sugar';
import CaretFinder from '../caret/CaretFinder';
import CaretPosition from '../caret/CaretPosition';
import NodeType from '../dom/NodeType';
import TreeWalker from '../api/dom/TreeWalker';
import BoundaryLocation from '../keyboard/BoundaryLocation';
import InlineUtils from '../keyboard/InlineUtils';
import NormalizeRange from '../selection/NormalizeRange';
import { Selection } from '../api/dom/Selection';

// Walks the parent block to the right and look for BR elements
const hasRightSideContent = function (schema, container, parentBlock) {
  const walker = new TreeWalker(container, parentBlock);
  let node;
  const nonEmptyElementsMap = schema.getNonEmptyElements();

  while ((node = walker.next())) {
    if (nonEmptyElementsMap[node.nodeName.toLowerCase()] || node.length > 0) {
      return true;
    }
  }
};

const scrollToBr = function (dom, selection: Selection, brElm) {
  // Insert temp marker and scroll to that
  const marker = dom.create('span', {}, '&nbsp;');
  brElm.parentNode.insertBefore(marker, brElm);
  selection.scrollIntoView(marker);
  dom.remove(marker);
};

const moveSelectionToBr = function (dom, selection: Selection, brElm, extraBr) {
  const rng = dom.createRng();

  if (!extraBr) {
    rng.setStartAfter(brElm);
    rng.setEndAfter(brElm);
  } else {
    rng.setStartBefore(brElm);
    rng.setEndBefore(brElm);
  }

  selection.setRng(rng);
};

const insertBrAtCaret = function (editor, evt) {
  // We load the current event in from EnterKey.js when appropriate to heed
  // certain event-specific variations such as ctrl-enter in a list
  const selection: Selection = editor.selection, dom = editor.dom;
  let brElm, extraBr;
  const rng = selection.getRng();

  NormalizeRange.normalize(dom, rng).each(function (normRng) {
    rng.setStart(normRng.startContainer, normRng.startOffset);
    rng.setEnd(normRng.endContainer, normRng.endOffset);
  });

  let offset = rng.startOffset;
  let container = rng.startContainer;

  // Resolve node index
  if (container.nodeType === 1 && container.hasChildNodes()) {
    const isAfterLastNodeInContainer = offset > container.childNodes.length - 1;

    container = container.childNodes[Math.min(offset, container.childNodes.length - 1)] || container;
    if (isAfterLastNodeInContainer && container.nodeType === 3) {
      offset = container.nodeValue.length;
    } else {
      offset = 0;
    }
  }

  let parentBlock = dom.getParent(container, dom.isBlock);
  const containerBlock = parentBlock ? dom.getParent(parentBlock.parentNode, dom.isBlock) : null;
  const containerBlockName = containerBlock ? containerBlock.nodeName.toUpperCase() : ''; // IE < 9 & HTML5

  // Enter inside block contained within a LI then split or insert before/after LI
  const isControlKey = evt && evt.ctrlKey;
  if (containerBlockName === 'LI' && !isControlKey) {
    parentBlock = containerBlock;
  }

  if (container && container.nodeType === 3 && offset >= container.nodeValue.length) {
    // Insert extra BR element at the end block elements
    if (!hasRightSideContent(editor.schema, container, parentBlock)) {
      brElm = dom.create('br');
      rng.insertNode(brElm);
      rng.setStartAfter(brElm);
      rng.setEndAfter(brElm);
      extraBr = true;
    }
  }

  brElm = dom.create('br');
  rng.insertNode(brElm);

  scrollToBr(dom, selection, brElm);
  moveSelectionToBr(dom, selection, brElm, extraBr);
  editor.undoManager.add();
};

const insertBrBefore = function (editor, inline) {
  const br = Element.fromTag('br');
  Insert.before(Element.fromDom(inline), br);
  editor.undoManager.add();
};

const insertBrAfter = function (editor, inline) {
  if (!hasBrAfter(editor.getBody(), inline)) {
    Insert.after(Element.fromDom(inline), Element.fromTag('br'));
  }

  const br = Element.fromTag('br');
  Insert.after(Element.fromDom(inline), br);
  scrollToBr(editor.dom, editor.selection, br.dom());
  moveSelectionToBr(editor.dom, editor.selection, br.dom(), false);
  editor.undoManager.add();
};

const isBeforeBr = function (pos) {
  return NodeType.isBr(pos.getNode());
};

const hasBrAfter = function (rootNode, startNode) {
  if (isBeforeBr(CaretPosition.after(startNode))) {
    return true;
  } else {
    return CaretFinder.nextPosition(rootNode, CaretPosition.after(startNode)).map(function (pos) {
      return NodeType.isBr(pos.getNode());
    }).getOr(false);
  }
};

const isAnchorLink = function (elm) {
  return elm && elm.nodeName === 'A' && 'href' in elm;
};

const isInsideAnchor = function (location) {
  return location.fold(
    Fun.constant(false),
    isAnchorLink,
    isAnchorLink,
    Fun.constant(false)
  );
};

const readInlineAnchorLocation = function (editor) {
  const isInlineTarget = Fun.curry(InlineUtils.isInlineTarget, editor);
  const position = CaretPosition.fromRangeStart(editor.selection.getRng());
  return BoundaryLocation.readLocation(isInlineTarget, editor.getBody(), position).filter(isInsideAnchor);
};

const insertBrOutsideAnchor = function (editor, location) {
  location.fold(
    Fun.noop,
    Fun.curry(insertBrBefore, editor),
    Fun.curry(insertBrAfter, editor),
    Fun.noop
  );
};

const insert = function (editor, evt?) {
  const anchorLocation = readInlineAnchorLocation(editor);

  if (anchorLocation.isSome()) {
    anchorLocation.each(Fun.curry(insertBrOutsideAnchor, editor));
  } else {
    insertBrAtCaret(editor, evt);
  }
};

export default {
  insert
};