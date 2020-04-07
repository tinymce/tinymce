/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr } from '@ephox/katamari';
import * as CaretContainer from './CaretContainer';
import CaretPosition from './CaretPosition';
import * as NodeType from '../dom/NodeType';
import * as Zwsp from '../text/Zwsp';
import { Node, Text } from '@ephox/dom-globals';

const isElement = NodeType.isElement;
const isText = NodeType.isText;

const removeNode = (node: Node) => {
  const parentNode = node.parentNode;
  if (parentNode) {
    parentNode.removeChild(node);
  }
};

const getNodeValue = (node: Node): string => {
  try {
    return node.nodeValue;
  } catch (ex) {
    // IE sometimes produces "Invalid argument" on nodes
    return '';
  }
};

const setNodeValue = (node: Node, text: string) => {
  if (text.length === 0) {
    removeNode(node);
  } else {
    node.nodeValue = text;
  }
};

const trimCount = (text: string) => {
  const trimmedText = Zwsp.trim(text);
  return { count: text.length - trimmedText.length, text: trimmedText };
};

const removeUnchanged = (caretContainer: Node, pos: CaretPosition): CaretPosition => {
  remove(caretContainer);
  return pos;
};

const removeTextAndReposition = (caretContainer: Text, pos: CaretPosition): CaretPosition => {
  const before = trimCount(caretContainer.data.substr(0, pos.offset()));
  const after = trimCount(caretContainer.data.substr(pos.offset()));
  const text = before.text + after.text;

  if (text.length > 0) {
    setNodeValue(caretContainer, text);
    return CaretPosition(caretContainer, pos.offset() - before.count);
  } else {
    return pos;
  }
};

const removeElementAndReposition = (caretContainer: Node, pos: CaretPosition): CaretPosition => {
  const parentNode = pos.container();
  const newPosition = Arr.indexOf(Arr.from(parentNode.childNodes), caretContainer).map(function (index) {
    return index < pos.offset() ? CaretPosition(parentNode, pos.offset() - 1) : pos;
  }).getOr(pos);
  remove(caretContainer);
  return newPosition;
};

const removeTextCaretContainer = (caretContainer: Node, pos: CaretPosition) => isText(caretContainer) && pos.container() === caretContainer ? removeTextAndReposition(caretContainer, pos) : removeUnchanged(caretContainer, pos);

const removeElementCaretContainer = (caretContainer: Node, pos: CaretPosition) => pos.container() === caretContainer.parentNode ? removeElementAndReposition(caretContainer, pos) : removeUnchanged(caretContainer, pos);

const removeAndReposition = (container: Node, pos: CaretPosition) => CaretPosition.isTextPosition(pos) ? removeTextCaretContainer(container, pos) : removeElementCaretContainer(container, pos);

const remove = (caretContainerNode: Node) => {
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

export {
  removeAndReposition,
  remove
};
