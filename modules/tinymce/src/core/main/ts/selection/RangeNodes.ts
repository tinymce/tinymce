import { Num } from '@ephox/katamari';

import * as NodeType from '../dom/NodeType';

const getSelectedNode = (range: Range): Node | null => {
  const startContainer = range.startContainer,
    startOffset = range.startOffset;

  if (startContainer === range.endContainer && startContainer.hasChildNodes() && range.endOffset === startOffset + 1) {
    return startContainer.childNodes[startOffset];
  }

  return null;
};

const getNode = (container: Node, offset: number): Node => {
  if (NodeType.isElement(container) && container.hasChildNodes()) {
    const childNodes = container.childNodes;
    const safeOffset = Num.clamp(offset, 0, childNodes.length - 1);
    return childNodes[safeOffset];
  } else {
    return container;
  }
};

export {
  getSelectedNode,
  getNode
};
