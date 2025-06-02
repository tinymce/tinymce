import RangeUtils from '../api/dom/RangeUtils';
import * as NodeType from '../dom/NodeType';

// TODO: This is a clone of the list bookmark code if we move lists to core then de-duplicate this

interface Point {
  readonly container: Node;
  readonly offset: number;
}

const getNormalizedPoint = (container: Node, offset: number): Point => {
  if (NodeType.isText(container)) {
    return { container, offset };
  }

  const node = RangeUtils.getNode(container, offset);
  if (NodeType.isText(node)) {
    return {
      container: node,
      offset: offset >= container.childNodes.length ? node.data.length : 0
    };
  } else if (node.previousSibling && NodeType.isText(node.previousSibling)) {
    return {
      container: node.previousSibling,
      offset: node.previousSibling.data.length
    };
  } else if (node.nextSibling && NodeType.isText(node.nextSibling)) {
    return {
      container: node.nextSibling,
      offset: 0
    };
  }

  return { container, offset };
};

const normalizeRange = (rng: Range): Range => {
  const outRng = rng.cloneRange();

  const rangeStart = getNormalizedPoint(rng.startContainer, rng.startOffset);
  outRng.setStart(rangeStart.container, rangeStart.offset);

  const rangeEnd = getNormalizedPoint(rng.endContainer, rng.endOffset);
  outRng.setEnd(rangeEnd.container, rangeEnd.offset);

  return outRng;
};

export {
  getNormalizedPoint,
  normalizeRange
};
