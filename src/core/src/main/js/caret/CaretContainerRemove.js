/**
 * CaretContainerRemove.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.caret.CaretContainerRemove',
  [
    'ephox.katamari.api.Arr',
    'tinymce.core.caret.CaretContainer',
    'tinymce.core.caret.CaretPosition',
    'tinymce.core.dom.NodeType',
    'tinymce.core.text.Zwsp',
    'tinymce.core.util.Tools'
  ],
  function (Arr, CaretContainer, CaretPosition, NodeType, Zwsp, Tools) {
    var isElement = NodeType.isElement;
    var isText = NodeType.isText;

    var removeNode = function (node) {
      var parentNode = node.parentNode;
      if (parentNode) {
        parentNode.removeChild(node);
      }
    };

    var getNodeValue = function (node) {
      try {
        return node.nodeValue;
      } catch (ex) {
        // IE sometimes produces "Invalid argument" on nodes
        return "";
      }
    };

    var setNodeValue = function (node, text) {
      if (text.length === 0) {
        removeNode(node);
      } else {
        node.nodeValue = text;
      }
    };

    var trimCount = function (text) {
      var trimmedText = Zwsp.trim(text);
      return { count: text.length - trimmedText.length, text: trimmedText };
    };

    var removeUnchanged = function (caretContainer, pos) {
      remove(caretContainer);
      return pos;
    };

    var removeTextAndReposition = function (caretContainer, pos) {
      var before = trimCount(caretContainer.data.substr(0, pos.offset()));
      var after = trimCount(caretContainer.data.substr(pos.offset()));
      var text = before.text + after.text;

      if (text.length > 0) {
        setNodeValue(caretContainer, text);
        return new CaretPosition(caretContainer, pos.offset() - before.count);
      } else {
        return pos;
      }
    };

    var removeElementAndReposition = function (caretContainer, pos) {
      var parentNode = pos.container();
      var newPosition = Arr.indexOf(parentNode.childNodes, caretContainer).map(function (index) {
        return index < pos.offset() ? new CaretPosition(parentNode, pos.offset() - 1) : pos;
      }).getOr(pos);
      remove(caretContainer);
      return newPosition;
    };

    var removeTextCaretContainer = function (caretContainer, pos) {
      return pos.container() === caretContainer ? removeTextAndReposition(caretContainer, pos) : removeUnchanged(caretContainer, pos);
    };

    var removeElementCaretContainer = function (caretContainer, pos) {
      return pos.container() === caretContainer.parentNode ? removeElementAndReposition(caretContainer, pos) : removeUnchanged(caretContainer, pos);
    };

    var removeAndReposition = function (container, pos) {
      return CaretPosition.isTextPosition(pos) ? removeTextCaretContainer(container, pos) : removeElementCaretContainer(container, pos);
    };

    var remove = function (caretContainerNode) {
      if (isElement(caretContainerNode) && CaretContainer.isCaretContainer(caretContainerNode)) {
        if (CaretContainer.hasContent(caretContainerNode)) {
          caretContainerNode.removeAttribute('data-mce-caret');
        } else {
          removeNode(caretContainerNode);
        }
      }

      if (isText(caretContainerNode)) {
        var text = Zwsp.trim(getNodeValue(caretContainerNode));
        setNodeValue(caretContainerNode, text);
      }
    };

    return {
      removeAndReposition: removeAndReposition,
      remove: remove
    };
  }
);