/**
 * CaretBookmark.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import NodeType from '../dom/NodeType';
import DomUtils from '../api/dom/DOMUtils';
import Fun from '../util/Fun';
import Arr from '../util/Arr';
import CaretPosition from './CaretPosition';

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
 * var bookmark = CaretBookmark.create(rootElm, CaretPosition.before(rootElm.firstChild));
 * var caretPosition = CaretBookmark.resolve(bookmark);
 */

const isText = NodeType.isText;
const isBogus = NodeType.isBogus;
const nodeIndex = DomUtils.nodeIndex;

const normalizedParent = (node: Node): Node => {
  const parentNode = node.parentNode;

  if (isBogus(parentNode)) {
    return normalizedParent(parentNode);
  }

  return parentNode;
};

const getChildNodes = (node: Node): Node[] => {
  if (!node) {
    return [];
  }

  return Arr.reduce(node.childNodes, function (result, node) {
    if (isBogus(node) && node.nodeName !== 'BR') {
      result = result.concat(getChildNodes(node));
    } else {
      result.push(node);
    }

    return result;
  }, []);
};

const normalizedTextOffset = (node: Node, offset: number): number => {
  while ((node = node.previousSibling)) {
    if (!isText(node)) {
      break;
    }

    offset += node.data.length;
  }

  return offset;
};

const equal = (a) => (b) => a === b;

const normalizedNodeIndex = (node: Node): number => {
  let nodes, index, numTextFragments;

  nodes = getChildNodes(normalizedParent(node));
  index = Arr.findIndex(nodes, equal(node), node);
  nodes = nodes.slice(0, index + 1);
  numTextFragments = Arr.reduce(nodes, function (result, node, i) {
    if (isText(node) && isText(nodes[i - 1])) {
      result++;
    }

    return result;
  }, 0);

  nodes = Arr.filter(nodes, NodeType.matchNodeNames(node.nodeName));
  index = Arr.findIndex(nodes, equal(node), node);

  return index - numTextFragments;
};

const createPathItem = function (node) {
  let name;

  if (isText(node)) {
    name = 'text()';
  } else {
    name = node.nodeName.toLowerCase();
  }

  return name + '[' + normalizedNodeIndex(node) + ']';
};

const parentsUntil = function (root: Node, node: Node, predicate?): Node[] {
  const parents = [];

  for (node = node.parentNode; node !== root; node = node.parentNode) {
    if (predicate && predicate(node)) {
      break;
    }

    parents.push(node);
  }

  return parents;
};

const create = (root: Node, caretPosition: CaretPosition): string => {
  let container, offset, path = [],
    outputOffset, childNodes, parents;

  container = caretPosition.container();
  offset = caretPosition.offset();

  if (isText(container)) {
    outputOffset = normalizedTextOffset(container, offset);
  } else {
    childNodes = container.childNodes;
    if (offset >= childNodes.length) {
      outputOffset = 'after';
      offset = childNodes.length - 1;
    } else {
      outputOffset = 'before';
    }

    container = childNodes[offset];
  }

  path.push(createPathItem(container));
  parents = parentsUntil(root, container);
  parents = Arr.filter(parents, Fun.negate(NodeType.isBogus));
  path = path.concat(Arr.map(parents, function (node) {
    return createPathItem(node);
  }));

  return path.reverse().join('/') + ',' + outputOffset;
};

const resolvePathItem = (node: Node, name: string, index: number): Node => {
  let nodes = getChildNodes(node);

  nodes = Arr.filter(nodes, function (node, index) {
    return !isText(node) || !isText(nodes[index - 1]);
  });

  nodes = Arr.filter(nodes, NodeType.matchNodeNames(name));
  return nodes[index];
};

const findTextPosition = (container: Node, offset: number): CaretPosition => {
  let node = container, targetOffset = 0, dataLen;

  while (isText(node)) {
    dataLen = node.data.length;

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

const resolve = (root: Node, path: string): CaretPosition => {
  let parts, container, offset;

  if (!path) {
    return null;
  }

  parts = path.split(',');
  path = parts[0].split('/');
  offset = parts.length > 1 ? parts[1] : 'before';

  container = Arr.reduce(path, function (result, value) {
    value = /([\w\-\(\)]+)\[([0-9]+)\]/.exec(value);
    if (!value) {
      return null;
    }

    if (value[1] === 'text()') {
      value[1] = '#text';
    }

    return resolvePathItem(result, value[1], parseInt(value[2], 10));
  }, root);

  if (!container) {
    return null;
  }

  if (!isText(container)) {
    if (offset === 'after') {
      offset = nodeIndex(container) + 1;
    } else {
      offset = nodeIndex(container);
    }

    return CaretPosition(container.parentNode, offset);
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