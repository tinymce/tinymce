import DOMUtils from '../api/dom/DOMUtils';

/**
 * Handles paths of nodes within an element.
 *
 * @private
 * @class tinymce.dom.NodePath
 */

const create = (rootNode: Node, targetNode: Node, normalized?: boolean): number[] => {
  const path: number[] = [];

  for (let node: Node | null = targetNode; node && node !== rootNode; node = node.parentNode) {
    path.push(DOMUtils.nodeIndex(node, normalized));
  }

  return path;
};

const resolve = (rootNode: Node, path: number[]): Node | null => {
  let node: Node, i: number;

  for (node = rootNode, i = path.length - 1; i >= 0; i--) {
    const children = node.childNodes;

    if (path[i] > children.length - 1) {
      return null;
    }

    node = children[path[i]];
  }

  return node;
};

export {
  create,
  resolve
};
