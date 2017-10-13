/**
 * NodeType.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Contains various node validation functions.
 *
 * @private
 * @class tinymce.dom.NodeType
 */
define(
  'tinymce.core.dom.NodeType',
  [
  ],
  function () {
    var isNodeType = function (type) {
      return function (node) {
        return !!node && node.nodeType == type;
      };
    };

    var isElement = isNodeType(1);

    var matchNodeNames = function (names) {
      names = names.toLowerCase().split(' ');

      return function (node) {
        var i, name;

        if (node && node.nodeType) {
          name = node.nodeName.toLowerCase();

          for (i = 0; i < names.length; i++) {
            if (name === names[i]) {
              return true;
            }
          }
        }

        return false;
      };
    };

    var matchStyleValues = function (name, values) {
      values = values.toLowerCase().split(' ');

      return function (node) {
        var i, cssValue;

        if (isElement(node)) {
          for (i = 0; i < values.length; i++) {
            cssValue = node.ownerDocument.defaultView.getComputedStyle(node, null).getPropertyValue(name);
            if (cssValue === values[i]) {
              return true;
            }
          }
        }

        return false;
      };
    };

    var hasPropValue = function (propName, propValue) {
      return function (node) {
        return isElement(node) && node[propName] === propValue;
      };
    };

    var hasAttribute = function (attrName, attrValue) {
      return function (node) {
        return isElement(node) && node.hasAttribute(attrName);
      };
    };

    var hasAttributeValue = function (attrName, attrValue) {
      return function (node) {
        return isElement(node) && node.getAttribute(attrName) === attrValue;
      };
    };

    var isBogus = function (node) {
      return isElement(node) && node.hasAttribute('data-mce-bogus');
    };

    var hasContentEditableState = function (value) {
      return function (node) {
        if (isElement(node)) {
          if (node.contentEditable === value) {
            return true;
          }

          if (node.getAttribute('data-mce-contenteditable') === value) {
            return true;
          }
        }

        return false;
      };
    };

    return {
      isText: isNodeType(3),
      isElement: isElement,
      isComment: isNodeType(8),
      isDocument: isNodeType(9),
      isBr: matchNodeNames('br'),
      isContentEditableTrue: hasContentEditableState('true'),
      isContentEditableFalse: hasContentEditableState('false'),
      matchNodeNames: matchNodeNames,
      hasPropValue: hasPropValue,
      hasAttribute: hasAttribute,
      hasAttributeValue: hasAttributeValue,
      matchStyleValues: matchStyleValues,
      isBogus: isBogus
    };
  }
);