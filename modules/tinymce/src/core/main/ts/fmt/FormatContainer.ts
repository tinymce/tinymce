import * as NodeType from '../dom/NodeType';

const CARET_ID = '_mce_caret';
const isCaretNode = (node: Node): node is Element =>
  NodeType.isElement(node) && node.id === CARET_ID;

const getParentCaretContainer = (body: Node, node: Node): Element | null => {
  let currentNode: Node | null = node;
  while (currentNode && currentNode !== body) {
    if (isCaretNode(currentNode)) {
      return currentNode;
    }

    currentNode = currentNode.parentNode;
  }

  return null;
};

export {
  CARET_ID,
  isCaretNode,
  getParentCaretContainer
};
