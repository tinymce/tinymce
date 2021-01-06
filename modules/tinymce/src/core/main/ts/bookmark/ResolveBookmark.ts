/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Fun, Optional, Optionals } from '@ephox/katamari';
import DOMUtils from '../api/dom/DOMUtils';
import EditorSelection from '../api/dom/Selection';
import Env from '../api/Env';
import Tools from '../api/util/Tools';
import * as CaretFinder from '../caret/CaretFinder';
import CaretPosition from '../caret/CaretPosition';
import * as NodeType from '../dom/NodeType';
import { getParentCaretContainer } from '../fmt/FormatContainer';
import * as Zwsp from '../text/Zwsp';
import {
  Bookmark, IdBookmark, IndexBookmark, isIdBookmark, isIndexBookmark, isPathBookmark, isRangeBookmark, isStringPathBookmark, PathBookmark,
  StringPathBookmark
} from './BookmarkTypes';
import * as CaretBookmark from './CaretBookmark';

const addBogus = (dom: DOMUtils, node: Node): Node => {
  // Adds a bogus BR element for empty block elements
  if (NodeType.isElement(node) && dom.isBlock(node) && !node.innerHTML && !Env.ie) {
    node.innerHTML = '<br data-mce-bogus="1" />';
  }

  return node;
};

const resolveCaretPositionBookmark = (dom: DOMUtils, bookmark: StringPathBookmark) => {
  let pos;

  const rng = dom.createRng();
  pos = CaretBookmark.resolve(dom.getRoot(), bookmark.start);
  rng.setStart(pos.container(), pos.offset());

  pos = CaretBookmark.resolve(dom.getRoot(), bookmark.end);
  rng.setEnd(pos.container(), pos.offset());

  return rng;
};

const insertZwsp = (node: Node, rng: Range) => {
  const textNode = node.ownerDocument.createTextNode(Zwsp.ZWSP);
  node.appendChild(textNode);
  rng.setStart(textNode, 0);
  rng.setEnd(textNode, 0);
};

const isEmpty = (node: Node) => node.hasChildNodes() === false;

const tryFindRangePosition = (node: Element, rng: Range): boolean =>
  CaretFinder.lastPositionIn(node).fold(
    Fun.never,
    (pos) => {
      rng.setStart(pos.container(), pos.offset());
      rng.setEnd(pos.container(), pos.offset());
      return true;
    }
  );

// Since we trim zwsp from undo levels the caret format containers
// may be empty if so pad them with a zwsp and move caret there
const padEmptyCaretContainer = (root: HTMLElement, node: Node, rng: Range): boolean => {
  if (isEmpty(node) && getParentCaretContainer(root, node)) {
    insertZwsp(node, rng);
    return true;
  } else {
    return false;
  }
};

const setEndPoint = (dom: DOMUtils, start: boolean, bookmark: PathBookmark, rng: Range) => {
  const point = bookmark[start ? 'start' : 'end'];
  let i, node, offset, children;
  const root = dom.getRoot();

  if (point) {
    offset = point[0];

    // Find container node
    for (node = root, i = point.length - 1; i >= 1; i--) {
      children = node.childNodes;

      if (padEmptyCaretContainer(root, node, rng)) {
        return true;
      }

      if (point[i] > children.length - 1) {
        if (padEmptyCaretContainer(root, node, rng)) {
          return true;
        }

        return tryFindRangePosition(node, rng);
      }

      node = children[point[i]];
    }

    // Move text offset to best suitable location
    if (node.nodeType === 3) {
      offset = Math.min(point[0], node.nodeValue.length);
    }

    // Move element offset to best suitable location
    if (node.nodeType === 1) {
      offset = Math.min(point[0], node.childNodes.length);
    }

    // Set offset within container node
    if (start) {
      rng.setStart(node, offset);
    } else {
      rng.setEnd(node, offset);
    }
  }

  return true;
};

const isValidTextNode = (node: Node): node is Text => NodeType.isText(node) && node.data.length > 0;

const restoreEndPoint = (dom: DOMUtils, suffix: string, bookmark: IdBookmark): Optional<CaretPosition> => {
  let marker = dom.get(bookmark.id + '_' + suffix), node, idx, next, prev;
  const keep = bookmark.keep;
  let container, offset;

  if (marker) {
    node = marker.parentNode;

    if (suffix === 'start') {
      if (!keep) {
        idx = dom.nodeIndex(marker);
      } else {
        if (marker.hasChildNodes()) {
          node = marker.firstChild;
          idx = 1;
        } else if (isValidTextNode(marker.nextSibling)) {
          node = marker.nextSibling;
          idx = 0;
        } else if (isValidTextNode(marker.previousSibling)) {
          node = marker.previousSibling;
          idx = marker.previousSibling.data.length;
        } else {
          node = marker.parentNode;
          idx = dom.nodeIndex(marker) + 1;
        }
      }

      container = node;
      offset = idx;
    } else {
      if (!keep) {
        idx = dom.nodeIndex(marker);
      } else {
        if (marker.hasChildNodes()) {
          node = marker.firstChild;
          idx = 1;
        } else if (isValidTextNode(marker.previousSibling)) {
          node = marker.previousSibling;
          idx = marker.previousSibling.data.length;
        } else {
          node = marker.parentNode;
          idx = dom.nodeIndex(marker);
        }
      }

      container = node;
      offset = idx;
    }

    if (!keep) {
      prev = marker.previousSibling;
      next = marker.nextSibling;

      // Remove all marker text nodes
      Tools.each(Tools.grep(marker.childNodes), (node) => {
        if (NodeType.isText(node)) {
          node.nodeValue = node.nodeValue.replace(/\uFEFF/g, '');
        }
      });

      // Remove marker but keep children if for example contents where inserted into the marker
      // Also remove duplicated instances of the marker for example by a
      // split operation or by WebKit auto split on paste feature
      while ((marker = dom.get(bookmark.id + '_' + suffix))) {
        dom.remove(marker, true);
      }

      // If siblings are text nodes then merge them unless it's Opera since it some how removes the node
      // and we are sniffing since adding a lot of detection code for a browser with 3% of the market
      // isn't worth the effort. Sorry, Opera but it's just a fact
      if (prev && next && prev.nodeType === next.nodeType && NodeType.isText(prev) && !Env.opera) {
        idx = prev.nodeValue.length;
        prev.appendData(next.nodeValue);
        dom.remove(next);

        container = prev;
        offset = idx;
      }
    }

    return Optional.some(CaretPosition(container, offset));
  } else {
    return Optional.none<CaretPosition>();
  }
};

const resolvePaths = (dom: DOMUtils, bookmark: PathBookmark): Optional<Range> => {
  const rng = dom.createRng();

  if (setEndPoint(dom, true, bookmark, rng) && setEndPoint(dom, false, bookmark, rng)) {
    return Optional.some(rng);
  } else {
    return Optional.none();
  }
};

const resolveId = (dom: DOMUtils, bookmark: IdBookmark): Optional<Range> => {
  const startPos = restoreEndPoint(dom, 'start', bookmark);
  const endPos = restoreEndPoint(dom, 'end', bookmark);

  return Optionals.lift2(
    startPos,
    endPos.or(startPos),
    (spos, epos) => {
      const rng = dom.createRng();
      rng.setStart(addBogus(dom, spos.container()), spos.offset());
      rng.setEnd(addBogus(dom, epos.container()), epos.offset());
      return rng;
    }
  );
};

const resolveIndex = (dom: DOMUtils, bookmark: IndexBookmark): Optional<Range> => Optional.from(dom.select(bookmark.name)[bookmark.index]).map((elm) => {
  const rng = dom.createRng();
  rng.selectNode(elm);
  return rng;
});

const resolve = (selection: EditorSelection, bookmark: Bookmark): Optional<Range> => {
  const dom = selection.dom;

  if (bookmark) {
    if (isPathBookmark(bookmark)) {
      return resolvePaths(dom, bookmark);
    } else if (isStringPathBookmark(bookmark)) {
      return Optional.some(resolveCaretPositionBookmark(dom, bookmark));
    } else if (isIdBookmark(bookmark)) {
      return resolveId(dom, bookmark);
    } else if (isIndexBookmark(bookmark)) {
      return resolveIndex(dom, bookmark);
    } else if (isRangeBookmark(bookmark)) {
      return Optional.some(bookmark.rng);
    }
  }

  return Optional.none();
};

export {
  resolve
};
