import * as NodeType from '../dom/NodeType';
import { RangeLikeObject } from './RangeTypes';

const splitText = (node: Text, offset: number) => {
  return node.splitText(offset);
};

const split = (rng: RangeLikeObject): RangeLikeObject => {
  let startContainer = rng.startContainer,
    startOffset = rng.startOffset,
    endContainer = rng.endContainer,
    endOffset = rng.endOffset;

  // Handle single text node
  if (startContainer === endContainer && NodeType.isText(startContainer)) {
    if (startOffset > 0 && startOffset < startContainer.data.length) {
      endContainer = splitText(startContainer, startOffset);
      startContainer = endContainer.previousSibling as Text;

      if (endOffset > startOffset) {
        endOffset = endOffset - startOffset;
        const newContainer = splitText(endContainer as Text, endOffset).previousSibling as Text;
        startContainer = endContainer = newContainer;
        endOffset = newContainer.data.length;
        startOffset = 0;
      } else {
        endOffset = 0;
      }
    }
  } else {
    // Split startContainer text node if needed
    if (NodeType.isText(startContainer) && startOffset > 0 && startOffset < startContainer.data.length) {
      startContainer = splitText(startContainer, startOffset);
      startOffset = 0;
    }

    // Split endContainer text node if needed
    if (NodeType.isText(endContainer) && endOffset > 0 && endOffset < endContainer.data.length) {
      const newContainer = splitText(endContainer, endOffset).previousSibling as Text;
      endContainer = newContainer;
      endOffset = newContainer.data.length;
    }
  }

  return {
    startContainer,
    startOffset,
    endContainer,
    endOffset
  };
};

export {
  split
};
