/**
 * CaretContainerRemove.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { Arr } from '@ephox/katamari';
import CaretContainer from './CaretContainer';
import CaretPosition from './CaretPosition';
import NodeType from '../dom/NodeType';
import Zwsp from '../text/Zwsp';

const isElement = NodeType.isElement;
const isText = NodeType.isText;

const removeNode = function (node) {
  const parentNode = node.parentNode;
  if (parentNode) {
    parentNode.removeChild(node);
  }
};

const getNodeValue = function (node) {
  try {
    return node.nodeValue;
  } catch (ex) {
    // IE sometimes produces "Invalid argument" on nodes
    return '';
  }
};

const setNodeValue = function (node, text) {
  if (text.length === 0) {
    removeNode(node);
  } else {
    node.nodeValue = text;
  }
};

const trimCount = function (text) {
  const trimmedText = Zwsp.trim(text);
  return { count: text.length - trimmedText.length, text: trimmedText };
};

const removeUnchanged = function (caretContainer, pos) {
  remove(caretContainer);
  return pos;
};

const removeTextAndReposition = function (caretContainer, pos) {
  const before = trimCount(caretContainer.data.substr(0, pos.offset()));
  const after = trimCount(caretContainer.data.substr(pos.offset()));
  const text = before.text + after.text;

  if (text.length > 0) {
    setNodeValue(caretContainer, text);
    return new CaretPosition(caretContainer, pos.offset() - before.count);
  } else {
    return pos;
  }
};

const removeElementAndReposition = function (caretContainer, pos) {
  const parentNode = pos.container();
  const newPosition = Arr.indexOf(parentNode.childNodes, caretContainer).map(function (index) {
    return index < pos.offset() ? new CaretPosition(parentNode, pos.offset() - 1) : pos;
  }).getOr(pos);
  remove(caretContainer);
  return newPosition;
};

const removeTextCaretContainer = function (caretContainer, pos) {
  return pos.container() === caretContainer ? removeTextAndReposition(caretContainer, pos) : removeUnchanged(caretContainer, pos);
};

const removeElementCaretContainer = function (caretContainer, pos) {
  return pos.container() === caretContainer.parentNode ? removeElementAndReposition(caretContainer, pos) : removeUnchanged(caretContainer, pos);
};

const removeAndReposition = function (container, pos) {
  return CaretPosition.isTextPosition(pos) ? removeTextCaretContainer(container, pos) : removeElementCaretContainer(container, pos);
};

const remove = function (caretContainerNode) {
  if (isElement(caretContainerNode) && CaretContainer.isCaretContainer(caretContainerNode)) {
    if (CaretContainer.hasContent(caretContainerNode)) {
      caretContainerNode.removeAttribute('data-mce-caret');
    } else {
      removeNode(caretContainerNode);
    }
  }

  if (isText(caretContainerNode)) {
    const text = Zwsp.trim(getNodeValue(caretContainerNode));
    setNodeValue(caretContainerNode, text);
  }
};

export default {
  removeAndReposition,
  remove
};