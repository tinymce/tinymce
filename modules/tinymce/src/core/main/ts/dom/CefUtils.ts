import * as NodeType from './NodeType';

const getContentEditableRoot = (root: Node, node: Node): Node | null => {
  while (node && node !== root) {
    if (NodeType.isContentEditableTrue(node) || NodeType.isContentEditableFalse(node)) {
      return node;
    }

    node = node.parentNode;
  }

  return null;
};

export {
  getContentEditableRoot
};
