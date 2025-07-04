import { Type } from '@ephox/katamari';

import DOMUtils from '../api/dom/DOMUtils';
import * as NodeType from '../dom/NodeType';

import * as NormalizeBookmarkPoint from './NormalizeBookmarkPoint';

const DOM = DOMUtils.DOM;

export interface Bookmark {
  readonly startContainer: Node;
  readonly startOffset: number;
  readonly endContainer?: Node;
  readonly endOffset?: number;
}

const defaultMarker = () => DOM.create('span', { 'data-mce-type': 'bookmark' });

const setupEndPoint = (container: Node, offset: number, createMarker: () => HTMLElement) => {
  if (NodeType.isElement(container)) {
    const offsetNode = createMarker();

    if (container.hasChildNodes()) {
      if (offset === container.childNodes.length) {
        container.appendChild(offsetNode);
      } else {
        container.insertBefore(offsetNode, container.childNodes[offset]);
      }
    } else {
      container.appendChild(offsetNode);
    }

    return { container: offsetNode, offset: 0 };
  } else {
    return { container, offset };
  }
};

const restoreEndPoint = (container: Node, offset: number) => {
  const nodeIndex = (container: Node): number => {
    let node = container.parentNode?.firstChild;
    let idx = 0;

    while (node) {
      if (node === container) {
        return idx;
      }

      // Skip data-mce-type=bookmark nodes
      if (!NodeType.isElement(node) || node.getAttribute('data-mce-type') !== 'bookmark') {
        idx++;
      }

      node = node.nextSibling;
    }

    return -1;
  };

  if (NodeType.isElement(container) && Type.isNonNullable(container.parentNode)) {
    const node = container;
    offset = nodeIndex(container);
    container = container.parentNode;
    DOM.remove(node);

    if (!container.hasChildNodes() && DOM.isBlock(container)) {
      container.appendChild(DOM.create('br'));
    }
  }

  return { container, offset };
};

const createNormalizedRange = (startContainer: Node, startOffset: number, endContainer: Node, endOffset: number): Range => {
  const rng = DOM.createRng();

  rng.setStart(startContainer, startOffset);
  rng.setEnd(endContainer, endOffset);

  return NormalizeBookmarkPoint.normalizeRange(rng);
};

/**
 * Returns a range bookmark. This will convert indexed bookmarks into temporary span elements with
 * index 0 so that they can be restored properly after the DOM has been modified. Text bookmarks will not have spans
 * added to them since they can be restored after a dom operation.
 *
 * So this: <p><b>|</b><b>|</b></p>
 * becomes: <p><b><span data-mce-type="bookmark">|</span></b><b data-mce-type="bookmark">|</span></b></p>
 */
const createBookmark = (rng: Range, createMarker: () => HTMLElement = defaultMarker): Bookmark => {
  const { container: startContainer, offset: startOffset } = setupEndPoint(rng.startContainer, rng.startOffset, createMarker);

  if (rng.collapsed) {
    return { startContainer, startOffset };
  } else {
    const { container: endContainer, offset: endOffset } = setupEndPoint(rng.endContainer, rng.endOffset, createMarker);
    return { startContainer, startOffset, endContainer, endOffset };
  }
};

const resolveBookmark = (bookmark: Bookmark): Range => {
  const { container: startContainer, offset: startOffset } = restoreEndPoint(bookmark.startContainer, bookmark.startOffset);

  if (!Type.isUndefined(bookmark.endContainer) && !Type.isUndefined(bookmark.endOffset)) {
    const { container: endContainer, offset: endOffset } = restoreEndPoint(bookmark.endContainer, bookmark.endOffset);
    return createNormalizedRange(startContainer, startOffset, endContainer, endOffset);
  } else {
    return createNormalizedRange(startContainer, startOffset, startContainer, startOffset);
  }
};

export {
  createBookmark,
  resolveBookmark
};
