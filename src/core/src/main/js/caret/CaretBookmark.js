/**
 * CaretBookmark.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

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
define(
  'tinymce.core.caret.CaretBookmark',
  [
    'tinymce.core.dom.NodeType',
    'tinymce.core.dom.DOMUtils',
    'tinymce.core.util.Fun',
    'tinymce.core.util.Arr',
    'tinymce.core.caret.CaretPosition'
  ],
  function (NodeType, DomUtils, Fun, Arr, CaretPosition) {
    var isText = NodeType.isText,
      isBogus = NodeType.isBogus,
      nodeIndex = DomUtils.nodeIndex;

    function normalizedParent(node) {
      var parentNode = node.parentNode;

      if (isBogus(parentNode)) {
        return normalizedParent(parentNode);
      }

      return parentNode;
    }

    function getChildNodes(node) {
      if (!node) {
        return [];
      }

      return Arr.reduce(node.childNodes, function (result, node) {
        if (isBogus(node) && node.nodeName != 'BR') {
          result = result.concat(getChildNodes(node));
        } else {
          result.push(node);
        }

        return result;
      }, []);
    }

    function normalizedTextOffset(textNode, offset) {
      while ((textNode = textNode.previousSibling)) {
        if (!isText(textNode)) {
          break;
        }

        offset += textNode.data.length;
      }

      return offset;
    }

    function equal(targetValue) {
      return function (value) {
        return targetValue === value;
      };
    }

    function normalizedNodeIndex(node) {
      var nodes, index, numTextFragments;

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
    }

    function createPathItem(node) {
      var name;

      if (isText(node)) {
        name = 'text()';
      } else {
        name = node.nodeName.toLowerCase();
      }

      return name + '[' + normalizedNodeIndex(node) + ']';
    }

    function parentsUntil(rootNode, node, predicate) {
      var parents = [];

      for (node = node.parentNode; node != rootNode; node = node.parentNode) {
        if (predicate && predicate(node)) {
          break;
        }

        parents.push(node);
      }

      return parents;
    }

    function create(rootNode, caretPosition) {
      var container, offset, path = [],
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
      parents = parentsUntil(rootNode, container);
      parents = Arr.filter(parents, Fun.negate(NodeType.isBogus));
      path = path.concat(Arr.map(parents, function (node) {
        return createPathItem(node);
      }));

      return path.reverse().join('/') + ',' + outputOffset;
    }

    function resolvePathItem(node, name, index) {
      var nodes = getChildNodes(node);

      nodes = Arr.filter(nodes, function (node, index) {
        return !isText(node) || !isText(nodes[index - 1]);
      });

      nodes = Arr.filter(nodes, NodeType.matchNodeNames(name));
      return nodes[index];
    }

    function findTextPosition(container, offset) {
      var node = container, targetOffset = 0, dataLen;

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

      if (offset > container.data.length) {
        offset = container.data.length;
      }

      return new CaretPosition(container, offset);
    }

    function resolve(rootNode, path) {
      var parts, container, offset;

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
      }, rootNode);

      if (!container) {
        return null;
      }

      if (!isText(container)) {
        if (offset === 'after') {
          offset = nodeIndex(container) + 1;
        } else {
          offset = nodeIndex(container);
        }

        return new CaretPosition(container.parentNode, offset);
      }

      return findTextPosition(container, parseInt(offset, 10));
    }

    return {
      /**
       * Create a xpath bookmark location for the specified caret position.
       *
       * @method create
       * @param {Node} rootNode Root node to create bookmark within.
       * @param {tinymce.caret.CaretPosition} caretPosition Caret position within the root node.
       * @return {String} String xpath like location of caret position.
       */
      create: create,

      /**
       * Resolves a xpath like bookmark location to the a caret position.
       *
       * @method resolve
       * @param {Node} rootNode Root node to resolve xpath bookmark within.
       * @param {String} bookmark Bookmark string to resolve.
       * @return {tinymce.caret.CaretPosition} Caret position resolved from xpath like bookmark.
       */
      resolve: resolve
    };
  }
);