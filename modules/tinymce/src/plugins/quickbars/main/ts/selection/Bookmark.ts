import DOMUtils from 'tinymce/core/api/dom/DOMUtils';

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
const create = (dom: DOMUtils, rng: Range): Bookmark => {
  const bookmark: Partial<Bookmark> = {};

  const setupEndPoint = (start?: boolean) => {
    let container = rng[start ? 'startContainer' : 'endContainer'];
    let offset = rng[start ? 'startOffset' : 'endOffset'];

    if (container.nodeType === 1) {
      const offsetNode = dom.create('span', { 'data-mce-type': 'bookmark' });

      if (container.hasChildNodes()) {
        offset = Math.min(offset, container.childNodes.length - 1);

        if (start) {
          container.insertBefore(offsetNode, container.childNodes[offset]);
        } else {
          dom.insertAfter(offsetNode, container.childNodes[offset]);
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

/**
 * Moves the selection to the current bookmark and removes any selection container wrappers.
 *
 * @param {Object} bookmark Bookmark object to move selection to.
 */
const resolve = (dom: DOMUtils, bookmark: Bookmark): Range => {
  const restoreEndPoint = (start?: boolean) => {
    const nodeIndex = (container: Node) => {
      let node = container.parentNode?.firstChild;
      let idx = 0;

      while (node) {
        if (node === container) {
          return idx;
        }

        // Skip data-mce-type=bookmark nodes
        if (node.nodeType !== 1 || (node as Element).getAttribute('data-mce-type') !== 'bookmark') {
          idx++;
        }

        node = node.nextSibling;
      }

      return -1;
    };

    let container = bookmark[start ? 'startContainer' : 'endContainer'];
    let offset = bookmark[start ? 'startOffset' : 'endOffset'];

    if (!container) {
      return;
    }

    if (container.nodeType === 1 && container.parentNode) {
      const node = container;
      offset = nodeIndex(container);
      container = container.parentNode;
      dom.remove(node);
    }

    bookmark[start ? 'startContainer' : 'endContainer'] = container;
    bookmark[start ? 'startOffset' : 'endOffset'] = offset as number;
  };

  restoreEndPoint(true);
  restoreEndPoint();

  const rng = dom.createRng();

  rng.setStart(bookmark.startContainer, bookmark.startOffset);

  if (bookmark.endContainer) {
    rng.setEnd(bookmark.endContainer, bookmark.endOffset as number);
  }

  return rng;
};

export {
  create,
  resolve
};
