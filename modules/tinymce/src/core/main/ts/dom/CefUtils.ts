import * as NodeType from './NodeType';

const getContentEditableRoot = (root: Node, node: Node | null | undefined): Node | null => {
  let tempNode: Node | null | undefined = node;
  while (tempNode && tempNode !== root) {
    if (NodeType.isContentEditableTrue(tempNode) || NodeType.isContentEditableFalse(tempNode)) {
      return tempNode;
    }

    tempNode = tempNode.parentNode;
  }

  return null;
};

export {
  getContentEditableRoot
};
