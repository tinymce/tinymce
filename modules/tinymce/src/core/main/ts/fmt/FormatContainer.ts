import * as NodeType from '../dom/NodeType';

const CARET_ID = '_mce_caret';
const isCaretNode = (node: Node) => NodeType.isElement(node) && node.id === CARET_ID;

const getParentCaretContainer = (body: Node, node: Node) => {
  while (node && node !== body) {
    if ((node as Element).id === CARET_ID) {
      return node;
    }

    node = node.parentNode as Element;
  }

  return null;
};

export {
  isCaretNode,
  getParentCaretContainer
};
