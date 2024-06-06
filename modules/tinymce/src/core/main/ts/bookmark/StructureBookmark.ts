import * as NodeType from '../dom/NodeType';

export interface ElementBookmark {
  marker: Node;
  before: boolean;
}

export interface TextBookmark {
  text: Text;
  offset: number;
}

type BookmarkEndpoint = ElementBookmark | TextBookmark;

export interface StructureBookmark {
  start: BookmarkEndpoint;
  end: BookmarkEndpoint;
}

const isTextEndpoint = (endpoint: BookmarkEndpoint): endpoint is TextBookmark => endpoint.hasOwnProperty('text');
const isElementEndpoint = (endpoint: BookmarkEndpoint): endpoint is ElementBookmark => endpoint.hasOwnProperty('marker');

export const getBookmark = (range: Range, createMarker: () => Node): StructureBookmark => {
  const getEndpoint = (container: Node, offset: number): ElementBookmark | TextBookmark => {
    if (NodeType.isText(container)) {
      return { text: container, offset };
    } else {
      const marker = createMarker();
      const children = container.childNodes;
      if (offset < children.length) {
        container.insertBefore(marker, children[offset]);
        return { marker, before: true };
      } else {
        container.appendChild(marker);
        return { marker, before: false };
      }
    }
  };

  const end = getEndpoint(range.endContainer, range.endOffset);
  const start = getEndpoint(range.startContainer, range.startOffset);

  return { start, end };
};

export const resolveBookmark = (bm: StructureBookmark): Range => {
  const { start, end } = bm;
  const rng = new window.Range();

  if (isTextEndpoint(start)) {
    rng.setStart(start.text, start.offset);
  } else {
    if (isElementEndpoint(start)) {
      if (start.before) {
        rng.setStartBefore(start.marker);
      } else {
        rng.setStartAfter(start.marker);
      }
      start.marker.parentNode?.removeChild(start.marker);
    }
  }

  if (isTextEndpoint(end)) {
    rng.setEnd(end.text, end.offset);
  } else {
    if (isElementEndpoint(end)) {
      if (end.before) {
        rng.setEndBefore(end.marker);
      } else {
        rng.setEndAfter(end.marker);
      }
      end.marker.parentNode?.removeChild(end.marker);
    }
  }

  return rng;
};
