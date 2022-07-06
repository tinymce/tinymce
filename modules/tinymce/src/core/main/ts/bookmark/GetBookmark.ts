import { Fun } from '@ephox/katamari';

import DOMUtils from '../api/dom/DOMUtils';
import EditorSelection from '../api/dom/Selection';
import Tools from '../api/util/Tools';
import * as CaretContainer from '../caret/CaretContainer';
import CaretPosition from '../caret/CaretPosition';
import * as NodeType from '../dom/NodeType';
import { rangeInsertNode } from '../selection/RangeInsertNode';
import * as RangeNodes from '../selection/RangeNodes';
import * as Zwsp from '../text/Zwsp';
import { Bookmark, IdBookmark, IndexBookmark, PathBookmark, RangeBookmark, StringPathBookmark } from './BookmarkTypes';
import * as CaretBookmark from './CaretBookmark';

type TrimFn = (s: string) => string;

const isContentEditableFalse = NodeType.isContentEditableFalse;

const getNormalizedTextOffset = (trim: TrimFn, container: Text, offset: number): number => {
  let trimmedOffset = trim(container.data.slice(0, offset)).length;
  for (let node = container.previousSibling; node && NodeType.isText(node); node = node.previousSibling) {
    trimmedOffset += trim(node.data).length;
  }

  return trimmedOffset;
};

const getPoint = (dom: DOMUtils, trim: TrimFn, normalized: boolean, rng: Range, start: boolean) => {
  const container = start ? rng.startContainer : rng.endContainer;
  let offset = start ? rng.startOffset : rng.endOffset;
  const point: number[] = [];
  const root = dom.getRoot();

  if (NodeType.isText(container)) {
    point.push(normalized ? getNormalizedTextOffset(trim, container, offset) : offset);
  } else {
    let after = 0;
    const childNodes = container.childNodes;

    if (offset >= childNodes.length && childNodes.length) {
      after = 1;
      offset = Math.max(0, childNodes.length - 1);
    }

    point.push(dom.nodeIndex(childNodes[offset], normalized) + after);
  }

  for (let node: Node | null = container; node && node !== root; node = node.parentNode) {
    point.push(dom.nodeIndex(node, normalized));
  }

  return point;
};

const getLocation = (trim: TrimFn, selection: EditorSelection, normalized: boolean, rng: Range): PathBookmark => {
  const dom = selection.dom;
  const start = getPoint(dom, trim, normalized, rng, true);
  const forward = selection.isForward();
  const fakeCaret = CaretContainer.isRangeInCaretContainerBlock(rng) ? { isFakeCaret: true } : {};

  if (!selection.isCollapsed()) {
    const end = getPoint(dom, trim, normalized, rng, false);
    return { start, end, forward, ...fakeCaret };
  } else {
    return { start, forward, ...fakeCaret };
  }
};

const findIndex = (dom: DOMUtils, name: string, element: Element) => {
  let count = 0;

  Tools.each(dom.select(name), (node) => {
    if (node.getAttribute('data-mce-bogus') === 'all') {
      return;
    } else if (node === element) {
      return false;
    } else {
      count++;
      return;
    }
  });

  return count;
};

const moveEndPoint = (rng: Range, start: boolean) => {
  let container = start ? rng.startContainer : rng.endContainer;
  let offset = start ? rng.startOffset : rng.endOffset;

  // normalize Table Cell selection
  if (NodeType.isElement(container) && container.nodeName === 'TR') {
    const childNodes = container.childNodes;
    container = childNodes[Math.min(start ? offset : offset - 1, childNodes.length - 1)];
    if (container) {
      offset = start ? 0 : container.childNodes.length;
      if (start) {
        rng.setStart(container, offset);
      } else {
        rng.setEnd(container, offset);
      }
    }
  }
};

const normalizeTableCellSelection = (rng: Range) => {
  moveEndPoint(rng, true);
  moveEndPoint(rng, false);

  return rng;
};

const findSibling = (node: Node, offset: number): Element | undefined => {
  if (NodeType.isElement(node)) {
    node = RangeNodes.getNode(node, offset);
    if (isContentEditableFalse(node)) {
      return node;
    }
  }

  if (CaretContainer.isCaretContainer(node)) {
    if (NodeType.isText(node) && CaretContainer.isCaretContainerBlock(node)) {
      node = node.parentNode as Element;
    }

    let sibling = node.previousSibling;
    if (isContentEditableFalse(sibling)) {
      return sibling;
    }

    sibling = node.nextSibling;
    if (isContentEditableFalse(sibling)) {
      return sibling;
    }
  }

  return undefined;
};

const findAdjacentContentEditableFalseElm = (rng: Range) => {
  return findSibling(rng.startContainer, rng.startOffset) || findSibling(rng.endContainer, rng.endOffset);
};

const getOffsetBookmark = (trim: TrimFn, normalized: boolean, selection: EditorSelection): IndexBookmark | PathBookmark => {
  const element = selection.getNode();
  const rng = selection.getRng();

  if (element.nodeName === 'IMG' || isContentEditableFalse(element)) {
    const name = element.nodeName;
    return { name, index: findIndex(selection.dom, name, element) };
  }

  const sibling = findAdjacentContentEditableFalseElm(rng);
  if (sibling) {
    const name = sibling.tagName;
    return { name, index: findIndex(selection.dom, name, sibling) };
  }

  return getLocation(trim, selection, normalized, rng);
};

const getCaretBookmark = (selection: EditorSelection): StringPathBookmark => {
  const rng = selection.getRng();

  return {
    start: CaretBookmark.create(selection.dom.getRoot(), CaretPosition.fromRangeStart(rng)),
    end: CaretBookmark.create(selection.dom.getRoot(), CaretPosition.fromRangeEnd(rng)),
    forward: selection.isForward()
  };
};

const getRangeBookmark = (selection: EditorSelection): RangeBookmark => {
  return { rng: selection.getRng(), forward: selection.isForward() };
};

const createBookmarkSpan = (dom: DOMUtils, id: string, filled: boolean) => {
  const args = { 'data-mce-type': 'bookmark', id, 'style': 'overflow:hidden;line-height:0px' };
  return filled ? dom.create('span', args, '&#xFEFF;') : dom.create('span', args);
};

const getPersistentBookmark = (selection: EditorSelection, filled: boolean): IdBookmark | IndexBookmark => {
  const dom = selection.dom;
  let rng = selection.getRng();
  const id = dom.uniqueId();
  const collapsed = selection.isCollapsed();
  const element = selection.getNode();
  const name = element.nodeName;
  const forward = selection.isForward();

  if (name === 'IMG') {
    return { name, index: findIndex(dom, name, element) };
  }

  // W3C method
  const rng2 = normalizeTableCellSelection(rng.cloneRange());

  // Insert end marker
  if (!collapsed) {
    rng2.collapse(false);
    const endBookmarkNode = createBookmarkSpan(dom, id + '_end', filled);
    rangeInsertNode(dom, rng2, endBookmarkNode);
  }

  rng = normalizeTableCellSelection(rng);
  rng.collapse(true);
  const startBookmarkNode = createBookmarkSpan(dom, id + '_start', filled);
  rangeInsertNode(dom, rng, startBookmarkNode);

  selection.moveToBookmark({ id, keep: true, forward });

  return { id, forward };
};

const getBookmark = (selection: EditorSelection, type?: number, normalized: boolean = false): Bookmark => {
  if (type === 2) {
    return getOffsetBookmark(Zwsp.trim, normalized, selection);
  } else if (type === 3) {
    return getCaretBookmark(selection);
  } else if (type) {
    return getRangeBookmark(selection);
  } else {
    return getPersistentBookmark(selection, false);
  }
};

const getUndoBookmark = Fun.curry(getOffsetBookmark, Fun.identity, true) as (selection: EditorSelection) => IndexBookmark | PathBookmark;

export {
  getBookmark,
  getUndoBookmark,
  getPersistentBookmark
};
