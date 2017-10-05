/**
 * CaretCandidate.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This module contains logic for handling caret candidates. A caret candidate is
 * for example text nodes, images, input elements, cE=false elements etc.
 *
 * @private
 * @class tinymce.caret.CaretCandidate
 */
define(
  'tinymce.core.caret.CaretCandidate',
  [
    "tinymce.core.dom.NodeType",
    "tinymce.core.util.Arr",
    "tinymce.core.caret.CaretContainer"
  ],
  function (NodeType, Arr, CaretContainer) {
    var isContentEditableTrue = NodeType.isContentEditableTrue,
      isContentEditableFalse = NodeType.isContentEditableFalse,
      isBr = NodeType.isBr,
      isText = NodeType.isText,
      isInvalidTextElement = NodeType.matchNodeNames('script style textarea'),
      isAtomicInline = NodeType.matchNodeNames('img input textarea hr iframe video audio object'),
      isTable = NodeType.matchNodeNames('table'),
      isCaretContainer = CaretContainer.isCaretContainer;

    var isCaretCandidate = function (node) {
      if (isCaretContainer(node)) {
        return false;
      }

      if (isText(node)) {
        if (isInvalidTextElement(node.parentNode)) {
          return false;
        }

        return true;
      }

      return isAtomicInline(node) || isBr(node) || isTable(node) || isContentEditableFalse(node);
    };

    var isInEditable = function (node, rootNode) {
      for (node = node.parentNode; node && node != rootNode; node = node.parentNode) {
        if (isContentEditableFalse(node)) {
          return false;
        }

        if (isContentEditableTrue(node)) {
          return true;
        }
      }

      return true;
    };

    var isAtomicContentEditableFalse = function (node) {
      if (!isContentEditableFalse(node)) {
        return false;
      }

      return Arr.reduce(node.getElementsByTagName('*'), function (result, elm) {
        return result || isContentEditableTrue(elm);
      }, false) !== true;
    };

    var isAtomic = function (node) {
      return isAtomicInline(node) || isAtomicContentEditableFalse(node);
    };

    var isEditableCaretCandidate = function (node, rootNode) {
      return isCaretCandidate(node) && isInEditable(node, rootNode);
    };

    return {
      isCaretCandidate: isCaretCandidate,
      isInEditable: isInEditable,
      isAtomic: isAtomic,
      isEditableCaretCandidate: isEditableCaretCandidate
    };
  }
);