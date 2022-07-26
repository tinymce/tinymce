import DOMUtils from 'tinymce/core/api/dom/DOMUtils';

import * as NodeType from './NodeType';
import * as Range from './RangeUtils';

const DOM = DOMUtils.DOM;

interface Bookmark {
  startContainer: Node;
  startOffset: number;
  endContainer?: Node;
  endOffset?: number;
}

/**
 * Returns a range bookmark. This will convert indexed bookmarks into temporary span elements with
 * index 0 so that they can be restored properly after the DOM has been modified. Text bookmarks will not have spans
 * added to them since they can be restored after a dom operation.
 *
 * So this: <p><b>|</b><b>|</b></p>
 * becomes: <p><b><span data-mce-type="bookmark">|</span></b><b data-mce-type="bookmark">|</span></b></p>
 *
 * @param  {DOMRange} rng DOM Range to get bookmark on.
 * @return {Object} Bookmark object.
 */
const createBookmark = (rng: Range): Bookmark => {
  const bookmark: Partial<Bookmark> = {};

  const setupEndPoint = (start?: boolean) => {
    let container = rng[start ? 'startContainer' : 'endContainer'];
    let offset = rng[start ? 'startOffset' : 'endOffset'];

    if (NodeType.isElement(container)) {
      const offsetNode = DOM.create('span', { 'data-mce-type': 'bookmark' });

      if (container.hasChildNodes()) {
        offset = Math.min(offset, container.childNodes.length - 1);

        if (start) {
          container.insertBefore(offsetNode, container.childNodes[offset]);
        } else {
          DOM.insertAfter(offsetNode, container.childNodes[offset]);
        }
      } else {
        container.appendChild(offsetNode);
      }

      container = offsetNode;
      offset = 0;
    }

    bookmark[start ? 'startContainer' : 'endContainer'] = container;
    bookmark[start ? 'startOffset' : 'endOffset'] = offset;
  };

  setupEndPoint(true);

  if (!rng.collapsed) {
    setupEndPoint();
  }

  return bookmark as Bookmark;
};

const resolveBookmark = (bookmark: Bookmark): Range => {
  const restoreEndPoint = (start?: boolean) => {
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

    let container: Node | null | undefined = bookmark[start ? 'startContainer' : 'endContainer'];
    let offset = bookmark[start ? 'startOffset' : 'endOffset'];

    if (!container) {
      return;
    }

    if (NodeType.isElement(container) && container.parentNode) {
      const node = container;
      offset = nodeIndex(container);
      container = container.parentNode;
      DOM.remove(node);

      if (!container.hasChildNodes() && DOM.isBlock(container)) {
        container.appendChild(DOM.create('br'));
      }
    }

    bookmark[start ? 'startContainer' : 'endContainer'] = container;
    bookmark[start ? 'startOffset' : 'endOffset'] = offset as number;
  };

  restoreEndPoint(true);
  restoreEndPoint();

  const rng = DOM.createRng();

  rng.setStart(bookmark.startContainer, bookmark.startOffset);

  if (bookmark.endContainer) {
    rng.setEnd(bookmark.endContainer, bookmark.endOffset as number);
  }

  return Range.normalizeRange(rng);
};

export {
  createBookmark,
  resolveBookmark
};
