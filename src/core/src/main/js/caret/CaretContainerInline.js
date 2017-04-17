/**
 * CaretContainerInline.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.caret.CaretContainerInline',
  [
    'ephox.katamari.api.Fun',
    'tinymce.core.dom.NodeType',
    'tinymce.core.text.Zwsp'
  ],
  function (Fun, NodeType, Zwsp) {
    var isText = NodeType.isText;

    var startsWithCaretContainer = function (node) {
      return isText(node) && node.data[0] === Zwsp.ZWSP;
    };

    var endsWithCaretContainer = function (node) {
      return isText(node) && node.data[node.data.length - 1] === Zwsp.ZWSP;
    };

    var createZwsp = function (node) {
      return node.ownerDocument.createTextNode(Zwsp.ZWSP);
    };

    var insertBefore = function (node) {
      if (isText(node.previousSibling)) {
        if (endsWithCaretContainer(node.previousSibling)) {
          return node.previousSibling;
        } else {
          node.previousSibling.appendData(Zwsp.ZWSP);
          return node.previousSibling;
        }
      } else if (isText(node)) {
        if (startsWithCaretContainer(node)) {
          return node;
        } else {
          node.insertData(0, Zwsp.ZWSP);
          return node;
        }
      } else {
        var newNode = createZwsp(node);
        node.parentNode.insertBefore(newNode, node);
        return newNode;
      }
    };

    var insertAfter = function (node) {
      if (isText(node.nextSibling)) {
        if (startsWithCaretContainer(node.nextSibling)) {
          return node.nextSibling;
        } else {
          node.nextSibling.insertData(0, Zwsp.ZWSP);
          return node.nextSibling;
        }
      } else if (isText(node)) {
        if (endsWithCaretContainer(node)) {
          return node;
        } else {
          node.appendData(Zwsp.ZWSP);
          return node;
        }
      } else {
        var newNode = createZwsp(node);
        if (node.nextSibling) {
          node.parentNode.insertBefore(newNode, node.nextSibling);
        } else {
          node.parentNode.appendChild(newNode);
        }
        return newNode;
      }
    };

    var insertInline = function (before, node) {
      return before ? insertBefore(node) : insertAfter(node);
    };

    return {
      insertInline: insertInline,
      insertInlineBefore: Fun.curry(insertInline, true),
      insertInlineAfter: Fun.curry(insertInline, false)
    };
  }
);