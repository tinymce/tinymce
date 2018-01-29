/**
 * GetBookmark.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { Fun } from '@ephox/katamari';
import * as CaretBookmark from '../caret/CaretBookmark';
import * as CaretContainer from '../caret/CaretContainer';
import CaretPosition from '../caret/CaretPosition';
import NodeType from './NodeType';
import * as RangeNodes from '../selection/RangeNodes';
import Zwsp from '../text/Zwsp';
import Tools from '../api/util/Tools';
import { Selection } from '../api/dom/Selection';

const isContentEditableFalse = NodeType.isContentEditableFalse;

const getNormalizedTextOffset = function (trim, container, offset) {
  let node, trimmedOffset;

  trimmedOffset = trim(container.data.slice(0, offset)).length;
  for (node = container.previousSibling; node && NodeType.isText(node); node = node.previousSibling) {
    trimmedOffset += trim(node.data).length;
  }

  return trimmedOffset;
};

const getPoint = function (dom, trim, normalized, rng, start) {
  let container = rng[start ? 'startContainer' : 'endContainer'];
  let offset = rng[start ? 'startOffset' : 'endOffset'];
  const point = [];
  let  childNodes, after = 0;
  const root = dom.getRoot();

  if (NodeType.isText(container)) {
    point.push(normalized ? getNormalizedTextOffset(trim, container, offset) : offset);
  } else {
    childNodes = container.childNodes;

    if (offset >= childNodes.length && childNodes.length) {
      after = 1;
      offset = Math.max(0, childNodes.length - 1);
    }

    point.push(dom.nodeIndex(childNodes[offset], normalized) + after);
  }

  for (; container && container !== root; container = container.parentNode) {
    point.push(dom.nodeIndex(container, normalized));
  }

  return point;
};

const getLocation = function (trim, selection: Selection, normalized, rng) {
  const dom = selection.dom, bookmark: any = {};

  bookmark.start = getPoint(dom, trim, normalized, rng, true);

  if (!selection.isCollapsed()) {
    bookmark.end = getPoint(dom, trim, normalized, rng, false);
  }

  return bookmark;
};

const trimEmptyTextNode = function (node) {
  if (NodeType.isText(node) && node.data.length === 0) {
    node.parentNode.removeChild(node);
  }
};

const findIndex = function (dom, name, element) {
  let count = 0;

  Tools.each(dom.select(name), function (node) {
    if (node.getAttribute('data-mce-bogus') === 'all') {
      return;
    }

    if (node === element) {
      return false;
    }

    count++;
  });

  return count;
};

const moveEndPoint = function (rng, start) {
  let container, offset, childNodes;
  const prefix = start ? 'start' : 'end';

  container = rng[prefix + 'Container'];
  offset = rng[prefix + 'Offset'];

  if (NodeType.isElement(container) && container.nodeName === 'TR') {
    childNodes = container.childNodes;
    container = childNodes[Math.min(start ? offset : offset - 1, childNodes.length - 1)];
    if (container) {
      offset = start ? 0 : container.childNodes.length;
      rng['set' + (start ? 'Start' : 'End')](container, offset);
    }
  }
};

const normalizeTableCellSelection = function (rng) {
  moveEndPoint(rng, true);
  moveEndPoint(rng, false);

  return rng;
};

const findSibling = function (node, offset) {
  let sibling;

  if (NodeType.isElement(node)) {
    node = RangeNodes.getNode(node, offset);
    if (isContentEditableFalse(node)) {
      return node;
    }
  }

  if (CaretContainer.isCaretContainer(node)) {
    if (NodeType.isText(node) && CaretContainer.isCaretContainerBlock(node)) {
      node = node.parentNode;
    }

    sibling = node.previousSibling;
    if (isContentEditableFalse(sibling)) {
      return sibling;
    }

    sibling = node.nextSibling;
    if (isContentEditableFalse(sibling)) {
      return sibling;
    }
  }
};

const findAdjacentContentEditableFalseElm = function (rng) {
  return findSibling(rng.startContainer, rng.startOffset) || findSibling(rng.endContainer, rng.endOffset);
};

const getOffsetBookmark = function (trim, normalized, selection: Selection) {
  let element = selection.getNode();
  let name = element ? element.nodeName : null;
  const rng = selection.getRng();

  if (isContentEditableFalse(element) || name === 'IMG') {
    return { name, index: findIndex(selection.dom, name, element) };
  }

  element = findAdjacentContentEditableFalseElm(rng);
  if (element) {
    name = element.tagName;
    return { name, index: findIndex(selection.dom, name, element) };
  }

  return getLocation(trim, selection, normalized, rng);
};

const getCaretBookmark = function (selection: Selection) {
  const rng = selection.getRng();

  return {
    start: CaretBookmark.create(selection.dom.getRoot(), CaretPosition.fromRangeStart(rng)),
    end: CaretBookmark.create(selection.dom.getRoot(), CaretPosition.fromRangeEnd(rng))
  };
};

const getRangeBookmark = function (selection: Selection) {
  return { rng: selection.getRng() };
};

const getPersistentBookmark = function (selection: Selection) {
  const dom = selection.dom;
  let rng = selection.getRng();
  const id = dom.uniqueId();
  const collapsed = selection.isCollapsed();
  const styles = 'overflow:hidden;line-height:0px';
  const element = selection.getNode();
  const name = element.nodeName;
  const chr = '&#xFEFF;';

  if (name === 'IMG') {
    return { name, index: findIndex(dom, name, element) };
  }

  // W3C method
  const rng2 = normalizeTableCellSelection(rng.cloneRange());

  // Insert end marker
  if (!collapsed) {
    rng2.collapse(false);
    const endBookmarkNode = dom.create('span', { 'data-mce-type': 'bookmark', 'id': id + '_end', 'style': styles }, chr);
    rng2.insertNode(endBookmarkNode);
    trimEmptyTextNode(endBookmarkNode.nextSibling);
  }

  rng = normalizeTableCellSelection(rng);
  rng.collapse(true);
  const startBookmarkNode = dom.create('span', { 'data-mce-type': 'bookmark', 'id': id + '_start', 'style': styles }, chr);
  rng.insertNode(startBookmarkNode);
  trimEmptyTextNode(startBookmarkNode.previousSibling);

  selection.moveToBookmark({ id, keep: 1 });

  return { id };
};

const getBookmark = function (selection: Selection, type, normalized) {
  if (type === 2) {
    return getOffsetBookmark(Zwsp.trim, normalized, selection);
  } else if (type === 3) {
    return getCaretBookmark(selection);
  } else if (type) {
    return getRangeBookmark(selection);
  } else {
    return getPersistentBookmark(selection);
  }
};

export default {
  getBookmark,
  getUndoBookmark: Fun.curry(getOffsetBookmark, Fun.identity, true)
};