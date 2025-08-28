import { Fun } from '@ephox/katamari';

import DOMUtils from '../api/dom/DOMUtils';
import CaretPosition from '../caret/CaretPosition';
import * as NodeType from '../dom/NodeType';
import * as ArrUtils from '../util/ArrUtils';

/**
 * This module creates or resolves xpath like string representation of a CaretPositions.
 *
 * The format is a / separated list of chunks with:
 * <element|text()>[index|after|before]
 *
 * For example:
 *  p[0]/b[0]/text()[0],1 = <p><b>a|c</b></p>
 *  p[0]/img[0],before = <p>|<img></p>
 *  p[0]/img[0],after = <p><img>|</p>
 *
 * @private
 * @static
 * @class tinymce.caret.CaretBookmark
 * @example
 * const bookmark = CaretBookmark.create(rootElm, CaretPosition.before(rootElm.firstChild));
 * const caretPosition = CaretBookmark.resolve(bookmark);
 */

const isText = NodeType.isText;
const isBogus = NodeType.isBogus;
const nodeIndex = DOMUtils.nodeIndex;

const normalizedParent = (node: Node): Node | null => {
  const parentNode = node.parentNode;

  if (isBogus(parentNode)) {
    return normalizedParent(parentNode);
  }

  return parentNode;
};

const getChildNodes = (node: Node | null): Node[] => {
  if (!node) {
    return [];
  }

  return ArrUtils.reduce(node.childNodes, (result, node) => {
    if (isBogus(node) && node.nodeName !== 'BR') {
      result = result.concat(getChildNodes(node));
    } else {
      result.push(node);
    }

    return result;
  }, [] as Node[]);
};

const normalizedTextOffset = (node: Node, offset: number): number => {
  let tempNode: Node | null = node;
  while ((tempNode = tempNode.previousSibling)) {
    if (!isText(tempNode)) {
      break;
    }

    offset += tempNode.data.length;
  }

  return offset;
};

const equal = <T>(a: T) => (b: T) => a === b;

const normalizedNodeIndex = (node: Node): number => {
  let nodes: Node[], index: number;

  nodes = getChildNodes(normalizedParent(node));
  index = ArrUtils.findIndex(nodes, equal(node), node);
  nodes = nodes.slice(0, index + 1);
  const numTextFragments = ArrUtils.reduce(nodes, (result, node, i) => {
    if (isText(node) && isText(nodes[i - 1])) {
      result++;
    }

    return result;
  }, 0);

  nodes = ArrUtils.filter(nodes, NodeType.matchNodeNames([ node.nodeName ]));
  index = ArrUtils.findIndex(nodes, equal(node), node);

  return index - numTextFragments;
};

const createPathItem = (node: Node) => {
  const name = isText(node) ? 'text()' : node.nodeName.toLowerCase();
  return name + '[' + normalizedNodeIndex(node) + ']';
};

const parentsUntil = (root: Node, node: Node, predicate?: (node: Node) => boolean): Node[] => {
  const parents: Node[] = [];

  for (let tempNode = node.parentNode; tempNode && tempNode !== root; tempNode = tempNode.parentNode) {
    if (predicate && predicate(tempNode)) {
      break;
    }

    parents.push(tempNode);
  }

  return parents;
};

const create = (root: Node, caretPosition: CaretPosition): string => {
  let path: string[] = [];
  let container = caretPosition.container();
  let offset = caretPosition.offset();

  let outputOffset: number | 'before' | 'after';
  if (isText(container)) {
    outputOffset = normalizedTextOffset(container, offset);
  } else {
    const childNodes = container.childNodes;
    if (offset >= childNodes.length) {
      outputOffset = 'after';
      offset = childNodes.length - 1;
    } else {
      outputOffset = 'before';
    }

    container = childNodes[offset];
  }

  path.push(createPathItem(container));
  let parents = parentsUntil(root, container);
  parents = ArrUtils.filter(parents, Fun.not(NodeType.isBogus));
  path = path.concat(ArrUtils.map(parents, (node) => {
    return createPathItem(node);
  }));

  return path.reverse().join('/') + ',' + outputOffset;
};

const resolvePathItem = (node: Node | null, name: string, index: number): Node => {
  let nodes = getChildNodes(node);

  nodes = ArrUtils.filter(nodes, (node, index) => {
    return !isText(node) || !isText(nodes[index - 1]);
  });

  nodes = ArrUtils.filter(nodes, NodeType.matchNodeNames([ name ]));
  return nodes[index];
};

const findTextPosition = (container: Node, offset: number): CaretPosition => {
  let node = container;
  let targetOffset = 0;

  while (isText(node)) {
    const dataLen = node.data.length;

    if (offset >= targetOffset && offset <= targetOffset + dataLen) {
      container = node;
      offset = offset - targetOffset;
      break;
    }

    if (!isText(node.nextSibling)) {
      container = node;
      offset = dataLen;
      break;
    }

    targetOffset += dataLen;
    node = node.nextSibling;
  }

  if (isText(container) && offset > container.data.length) {
    offset = container.data.length;
  }

  return CaretPosition(container, offset);
};

const resolve = (root: Node, path: string | null | undefined): CaretPosition | null => {
  if (!path) {
    return null;
  }

  const parts = path.split(',');
  const paths = parts[0].split('/');
  const offset = parts.length > 1 ? parts[1] : 'before';

  const container = ArrUtils.reduce<string, Node | null>(paths, (result, value) => {
    const match = /([\w\-\(\)]+)\[([0-9]+)\]/.exec(value);
    if (!match) {
      return null;
    }

    if (match[1] === 'text()') {
      match[1] = '#text';
    }

    return resolvePathItem(result, match[1], parseInt(match[2], 10));
  }, root);

  if (!container) {
    return null;
  }

  if (!isText(container) && container.parentNode) {
    let nodeOffset: number;
    if (offset === 'after') {
      nodeOffset = nodeIndex(container) + 1;
    } else {
      nodeOffset = nodeIndex(container);
    }

    return CaretPosition(container.parentNode, nodeOffset);
  }

  return findTextPosition(container, parseInt(offset, 10));
};

export {
  /**
   * Create a xpath bookmark location for the specified caret position.
   *
   * @method create
   * @param {Node} rootNode Root node to create bookmark within.
   * @param {tinymce.caret.CaretPosition} caretPosition Caret position within the root node.
   * @return {String} String xpath like location of caret position.
   */
  create,

  /**
   * Resolves a xpath like bookmark location to the a caret position.
   *
   * @method resolve
   * @param {Node} rootNode Root node to resolve xpath bookmark within.
   * @param {String} bookmark Bookmark string to resolve.
   * @return {tinymce.caret.CaretPosition} Caret position resolved from xpath like bookmark.
   */
  resolve
};
