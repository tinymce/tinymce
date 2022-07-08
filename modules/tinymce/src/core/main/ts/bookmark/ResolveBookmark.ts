import { Fun, Optional, Optionals, Type } from '@ephox/katamari';

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

export interface BookmarkResolveResult {
  readonly range: Range;
  readonly forward: boolean;
}

const isForwardBookmark = (bookmark: Bookmark) =>
  !isIndexBookmark(bookmark) && Type.isBoolean(bookmark.forward) ? bookmark.forward : true;

const addBogus = (dom: DOMUtils, node: Node): Node => {
  // Adds a bogus BR element for empty block elements
  if (NodeType.isElement(node) && dom.isBlock(node) && !node.innerHTML) {
    node.innerHTML = '<br data-mce-bogus="1" />';
  }

  return node;
};

const resolveCaretPositionBookmark = (dom: DOMUtils, bookmark: StringPathBookmark): Optional<BookmarkResolveResult> => {
  const startPos = Optional.from(CaretBookmark.resolve(dom.getRoot(), bookmark.start));
  const endPos = Optional.from(CaretBookmark.resolve(dom.getRoot(), bookmark.end));

  return Optionals.lift2(startPos, endPos, (start, end) => {
    const range = dom.createRng();

    range.setStart(start.container(), start.offset());
    range.setEnd(end.container(), end.offset());

    return { range, forward: isForwardBookmark(bookmark) };
  });
};

const insertZwsp = (node: Node, rng: Range) => {
  const doc = node.ownerDocument ?? document;
  const textNode = doc.createTextNode(Zwsp.ZWSP);
  node.appendChild(textNode);
  rng.setStart(textNode, 0);
  rng.setEnd(textNode, 0);
};

const isEmpty = (node: Node) => !node.hasChildNodes();

const tryFindRangePosition = (node: Node, rng: Range): boolean =>
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
  const root = dom.getRoot();

  if (point) {
    let node: Node | null = root;
    let offset = point[0];

    // Find container node
    for (let i = point.length - 1; node && i >= 1; i--) {
      const children = node.childNodes as NodeListOf<ChildNode>;

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
    if (NodeType.isText(node)) {
      offset = Math.min(point[0], node.data.length);
    }

    // Move element offset to best suitable location
    if (NodeType.isElement(node)) {
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

const isValidTextNode = (node: Node | null): node is Text => NodeType.isText(node) && node.data.length > 0;

const restoreEndPoint = (dom: DOMUtils, suffix: string, bookmark: IdBookmark): Optional<CaretPosition> => {
  const marker = dom.get(bookmark.id + '_' + suffix);
  const markerParent = marker?.parentNode;
  const keep = bookmark.keep;

  if (marker && markerParent) {
    let container: Node;
    let offset: number;

    if (suffix === 'start') {
      if (!keep) {
        container = markerParent;
        offset = dom.nodeIndex(marker);
      } else {
        if (marker.hasChildNodes()) {
          container = marker.firstChild as Node;
          offset = 1;
        } else if (isValidTextNode(marker.nextSibling)) {
          container = marker.nextSibling;
          offset = 0;
        } else if (isValidTextNode(marker.previousSibling)) {
          container = marker.previousSibling;
          offset = marker.previousSibling.data.length;
        } else {
          container = markerParent;
          offset = dom.nodeIndex(marker) + 1;
        }
      }
    } else {
      if (!keep) {
        container = markerParent;
        offset = dom.nodeIndex(marker);
      } else {
        if (marker.hasChildNodes()) {
          container = marker.firstChild as Node;
          offset = 1;
        } else if (isValidTextNode(marker.previousSibling)) {
          container = marker.previousSibling;
          offset = marker.previousSibling.data.length;
        } else {
          container = markerParent;
          offset = dom.nodeIndex(marker);
        }
      }
    }

    if (!keep) {
      const prev = marker.previousSibling;
      const next = marker.nextSibling;

      // Remove all marker text nodes
      Tools.each(Tools.grep(marker.childNodes), (node) => {
        if (NodeType.isText(node)) {
          node.data = node.data.replace(/\uFEFF/g, '');
        }
      });

      // Remove marker but keep children if for example contents where inserted into the marker
      // Also remove duplicated instances of the marker for example by a
      // split operation or by WebKit auto split on paste feature
      let otherMarker: Node | null;
      while ((otherMarker = dom.get(bookmark.id + '_' + suffix))) {
        dom.remove(otherMarker, true);
      }

      // If siblings are text nodes then merge them unless it's Opera since it some how removes the node
      // and we are sniffing since adding a lot of detection code for a browser with 3% of the market
      // isn't worth the effort. Sorry, Opera but it's just a fact
      if (NodeType.isText(next) && NodeType.isText(prev) && !Env.browser.isOpera()) {
        const idx = prev.data.length;
        prev.appendData(next.data);
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

const resolvePaths = (dom: DOMUtils, bookmark: PathBookmark): Optional<BookmarkResolveResult> => {
  const range = dom.createRng();

  if (setEndPoint(dom, true, bookmark, range) && setEndPoint(dom, false, bookmark, range)) {
    return Optional.some({ range, forward: isForwardBookmark(bookmark) });
  } else {
    return Optional.none();
  }
};

const resolveId = (dom: DOMUtils, bookmark: IdBookmark): Optional<BookmarkResolveResult> => {
  const startPos = restoreEndPoint(dom, 'start', bookmark);
  const endPos = restoreEndPoint(dom, 'end', bookmark);

  return Optionals.lift2(
    startPos,
    endPos.or(startPos),
    (spos, epos) => {
      const range = dom.createRng();
      range.setStart(addBogus(dom, spos.container()), spos.offset());
      range.setEnd(addBogus(dom, epos.container()), epos.offset());
      return { range, forward: isForwardBookmark(bookmark) };
    }
  );
};

const resolveIndex = (dom: DOMUtils, bookmark: IndexBookmark): Optional<BookmarkResolveResult> => Optional.from(dom.select(bookmark.name)[bookmark.index]).map((elm) => {
  const range = dom.createRng();
  range.selectNode(elm);
  return { range, forward: true };
});

const resolve = (selection: EditorSelection, bookmark: Bookmark): Optional<BookmarkResolveResult> => {
  const dom = selection.dom;

  if (bookmark) {
    if (isPathBookmark(bookmark)) {
      return resolvePaths(dom, bookmark);
    } else if (isStringPathBookmark(bookmark)) {
      return resolveCaretPositionBookmark(dom, bookmark);
    } else if (isIdBookmark(bookmark)) {
      return resolveId(dom, bookmark);
    } else if (isIndexBookmark(bookmark)) {
      return resolveIndex(dom, bookmark);
    } else if (isRangeBookmark(bookmark)) {
      return Optional.some({ range: bookmark.rng, forward: isForwardBookmark(bookmark) });
    }
  }

  return Optional.none();
};

export {
  resolve
};
