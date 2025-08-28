import { Strings } from '@ephox/katamari';
import { PredicateFind, Remove, SugarElement, SugarNode } from '@ephox/sugar';

import Schema from '../api/html/Schema';
import CaretPosition from '../caret/CaretPosition';
import * as Nbsps from '../keyboard/Nbsps';
import * as Whitespace from '../text/Whitespace';

const normalize = (node: Text, offset: number, count: number, schema: Schema): void => {
  if (count === 0) {
    return;
  }
  const elm = SugarElement.fromDom(node);
  const root = PredicateFind.ancestor(elm, (el) => schema.isBlock(SugarNode.name(el))).getOr(elm);

  // Get the whitespace
  const whitespace = node.data.slice(offset, offset + count);

  // Determine if we're at the end or start of the content
  const isEndOfContent = offset + count >= node.data.length && Nbsps.needsToBeNbspRight(root, CaretPosition(node, node.data.length), schema);
  const isStartOfContent = offset === 0 && Nbsps.needsToBeNbspLeft(root, CaretPosition(node, 0), schema);

  // Replace the original whitespace with the normalized whitespace content
  node.replaceData(offset, count, Whitespace.normalize(whitespace, 4, isStartOfContent, isEndOfContent));
};

const normalizeWhitespaceAfter = (node: Text, offset: number, schema: Schema): void => {
  const content = node.data.slice(offset);
  const whitespaceCount = content.length - Strings.lTrim(content).length;

  normalize(node, offset, whitespaceCount, schema);
};

const normalizeWhitespaceBefore = (node: Text, offset: number, schema: Schema): void => {
  const content = node.data.slice(0, offset);
  const whitespaceCount = content.length - Strings.rTrim(content).length;

  normalize(node, offset - whitespaceCount, whitespaceCount, schema);
};

const mergeTextNodes = (prevNode: Text, nextNode: Text, schema: Schema, normalizeWhitespace?: boolean, mergeToPrev: boolean = true): Text => {
  const whitespaceOffset = Strings.rTrim(prevNode.data).length;
  const newNode = mergeToPrev ? prevNode : nextNode;
  const removeNode = mergeToPrev ? nextNode : prevNode;

  // Merge the elements
  if (mergeToPrev) {
    newNode.appendData(removeNode.data);
  } else {
    newNode.insertData(0, removeNode.data);
  }
  Remove.remove(SugarElement.fromDom(removeNode));

  // Normalize the whitespace around the merged elements, to ensure it doesn't get lost
  if (normalizeWhitespace) {
    normalizeWhitespaceAfter(newNode, whitespaceOffset, schema);
  }

  return newNode;
};

export {
  normalizeWhitespaceAfter,
  normalizeWhitespaceBefore,
  mergeTextNodes
};
