import { Fun } from '@ephox/katamari';

import * as NodeType from '../dom/NodeType';
import * as Zwsp from '../text/Zwsp';

const isText = NodeType.isText;
const startsWithCaretContainer = (node: Node): boolean =>
  isText(node) && node.data[0] === Zwsp.ZWSP;

const endsWithCaretContainer = (node: Node): boolean =>
  isText(node) && node.data[node.data.length - 1] === Zwsp.ZWSP;

const createZwsp = (node: Node): Text => {
  const doc = node.ownerDocument ?? document;
  return doc.createTextNode(Zwsp.ZWSP);
};

const insertBefore = (node: Node): Text => {
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
    const newNode = createZwsp(node);
    node.parentNode?.insertBefore(newNode, node);
    return newNode;
  }
};

const insertAfter = (node: Node): Text => {
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
    const newNode = createZwsp(node);
    if (node.nextSibling) {
      node.parentNode?.insertBefore(newNode, node.nextSibling);
    } else {
      node.parentNode?.appendChild(newNode);
    }
    return newNode;
  }
};

const insertInline = (before: boolean, node: Node): Text =>
  before ? insertBefore(node) : insertAfter(node);

const insertInlineBefore: (node: Node) => Text = Fun.curry(insertInline, true);
const insertInlineAfter: (node: Node) => Text = Fun.curry(insertInline, false);

export {
  insertInline,
  insertInlineBefore,
  insertInlineAfter
};
