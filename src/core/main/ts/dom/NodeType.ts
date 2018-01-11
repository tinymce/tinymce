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

const isNodeType = function (type) {
  return function (node) {
    return !!node && node.nodeType === type;
  };
};

const isElement = isNodeType(1);

const matchNodeNames = function (names) {
  names = names.toLowerCase().split(' ');

  return function (node) {
    let i, name;

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

const matchStyleValues = function (name, values) {
  values = values.toLowerCase().split(' ');

  return function (node) {
    let i, cssValue;

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

const hasPropValue = function (propName, propValue) {
  return function (node) {
    return isElement(node) && node[propName] === propValue;
  };
};

const hasAttribute = function (attrName, attrValue?) {
  return function (node) {
    return isElement(node) && node.hasAttribute(attrName);
  };
};

const hasAttributeValue = function (attrName, attrValue) {
  return function (node) {
    return isElement(node) && node.getAttribute(attrName) === attrValue;
  };
};

const isBogus = function (node) {
  return isElement(node) && node.hasAttribute('data-mce-bogus');
};

const hasContentEditableState = function (value) {
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

export default {
  isText: isNodeType(3),
  isElement,
  isComment: isNodeType(8),
  isDocument: isNodeType(9),
  isBr: matchNodeNames('br'),
  isContentEditableTrue: hasContentEditableState('true'),
  isContentEditableFalse: hasContentEditableState('false'),
  matchNodeNames,
  hasPropValue,
  hasAttribute,
  hasAttributeValue,
  matchStyleValues,
  isBogus
};