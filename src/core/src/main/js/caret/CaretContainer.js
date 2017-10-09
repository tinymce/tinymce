/**
 * CaretContainer.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This module handles caret containers. A caret container is a node that
 * holds the caret for positional purposes.
 *
 * @private
 * @class tinymce.caret.CaretContainer
 */
define(
  'tinymce.core.caret.CaretContainer',
  [
    'global!document',
    'tinymce.core.dom.NodeType',
    'tinymce.core.text.Zwsp'
  ],
  function (document, NodeType, Zwsp) {
    var isElement = NodeType.isElement,
      isText = NodeType.isText;

    var isCaretContainerBlock = function (node) {
      if (isText(node)) {
        node = node.parentNode;
      }

      return isElement(node) && node.hasAttribute('data-mce-caret');
    };

    var isCaretContainerInline = function (node) {
      return isText(node) && Zwsp.isZwsp(node.data);
    };

    var isCaretContainer = function (node) {
      return isCaretContainerBlock(node) || isCaretContainerInline(node);
    };

    var hasContent = function (node) {
      return node.firstChild !== node.lastChild || !NodeType.isBr(node.firstChild);
    };

    var insertInline = function (node, before) {
      var doc, sibling, textNode, parentNode;

      doc = node.ownerDocument;
      textNode = doc.createTextNode(Zwsp.ZWSP);
      parentNode = node.parentNode;

      if (!before) {
        sibling = node.nextSibling;
        if (isText(sibling)) {
          if (isCaretContainer(sibling)) {
            return sibling;
          }

          if (startsWithCaretContainer(sibling)) {
            sibling.splitText(1);
            return sibling;
          }
        }

        if (node.nextSibling) {
          parentNode.insertBefore(textNode, node.nextSibling);
        } else {
          parentNode.appendChild(textNode);
        }
      } else {
        sibling = node.previousSibling;
        if (isText(sibling)) {
          if (isCaretContainer(sibling)) {
            return sibling;
          }

          if (endsWithCaretContainer(sibling)) {
            return sibling.splitText(sibling.data.length - 1);
          }
        }

        parentNode.insertBefore(textNode, node);
      }

      return textNode;
    };

    var prependInline = function (node) {
      if (NodeType.isText(node)) {
        var data = node.data;
        if (data.length > 0 && data.charAt(0) !== Zwsp.ZWSP) {
          node.insertData(0, Zwsp.ZWSP);
        }
        return node;
      } else {
        return null;
      }
    };

    var appendInline = function (node) {
      if (NodeType.isText(node)) {
        var data = node.data;
        if (data.length > 0 && data.charAt(data.length - 1) !== Zwsp.ZWSP) {
          node.insertData(data.length, Zwsp.ZWSP);
        }
        return node;
      } else {
        return null;
      }
    };

    var isBeforeInline = function (pos) {
      return pos && NodeType.isText(pos.container()) && pos.container().data.charAt(pos.offset()) === Zwsp.ZWSP;
    };

    var isAfterInline = function (pos) {
      return pos && NodeType.isText(pos.container()) && pos.container().data.charAt(pos.offset() - 1) === Zwsp.ZWSP;
    };

    var createBogusBr = function () {
      var br = document.createElement('br');
      br.setAttribute('data-mce-bogus', '1');
      return br;
    };

    var insertBlock = function (blockName, node, before) {
      var doc, blockNode, parentNode;

      doc = node.ownerDocument;
      blockNode = doc.createElement(blockName);
      blockNode.setAttribute('data-mce-caret', before ? 'before' : 'after');
      blockNode.setAttribute('data-mce-bogus', 'all');
      blockNode.appendChild(createBogusBr());
      parentNode = node.parentNode;

      if (!before) {
        if (node.nextSibling) {
          parentNode.insertBefore(blockNode, node.nextSibling);
        } else {
          parentNode.appendChild(blockNode);
        }
      } else {
        parentNode.insertBefore(blockNode, node);
      }

      return blockNode;
    };

    var startsWithCaretContainer = function (node) {
      return isText(node) && node.data[0] == Zwsp.ZWSP;
    };

    var endsWithCaretContainer = function (node) {
      return isText(node) && node.data[node.data.length - 1] == Zwsp.ZWSP;
    };

    var trimBogusBr = function (elm) {
      var brs = elm.getElementsByTagName('br');
      var lastBr = brs[brs.length - 1];
      if (NodeType.isBogus(lastBr)) {
        lastBr.parentNode.removeChild(lastBr);
      }
    };

    var showCaretContainerBlock = function (caretContainer) {
      if (caretContainer && caretContainer.hasAttribute('data-mce-caret')) {
        trimBogusBr(caretContainer);
        caretContainer.removeAttribute('data-mce-caret');
        caretContainer.removeAttribute('data-mce-bogus');
        caretContainer.removeAttribute('style');
        caretContainer.removeAttribute('_moz_abspos');
        return caretContainer;
      }

      return null;
    };

    return {
      isCaretContainer: isCaretContainer,
      isCaretContainerBlock: isCaretContainerBlock,
      isCaretContainerInline: isCaretContainerInline,
      showCaretContainerBlock: showCaretContainerBlock,
      insertInline: insertInline,
      prependInline: prependInline,
      appendInline: appendInline,
      isBeforeInline: isBeforeInline,
      isAfterInline: isAfterInline,
      insertBlock: insertBlock,
      hasContent: hasContent,
      startsWithCaretContainer: startsWithCaretContainer,
      endsWithCaretContainer: endsWithCaretContainer
    };
  }
);