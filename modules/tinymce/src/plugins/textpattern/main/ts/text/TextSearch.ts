/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Node, Text } from '@ephox/dom-globals';
import { Arr, Option } from '@ephox/katamari';
import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import TextSeeker from 'tinymce/core/api/dom/TextSeeker';
import * as Spot from '../utils/Spot';
import { isText } from '../utils/Utils';

const DOM = DOMUtils.DOM;

export type ProcessCallback = (element: Text, offset: number) => number;

const alwaysNext = (startNode: Node) => (node: Node) => startNode === node ? -1 : 0;

// This largely is derived from robins isBoundary check, however it also treats contenteditable=false elements as a boundary
// See robins `Structure.isEmptyTag` for the list of quasi block elements
const isBoundary = (dom: DOMUtils) => (node: Node) => dom.isBlock(node) || Arr.contains([ 'BR', 'IMG', 'HR', 'INPUT' ], node.nodeName) || dom.getContentEditable(node) === 'false';

// Finds the text node before the specified node, or just returns the node if it's already on a text node
const textBefore = (node: Node, offset: number, rootNode: Node): Option<Spot.SpotPoint<Text>> => {
  if (isText(node) && offset >= 0) {
    return Option.some(Spot.point(node, offset));
  } else {
    const textSeeker = TextSeeker(DOM);
    return Option.from(textSeeker.backwards(node, offset, alwaysNext(node), rootNode)).map((prev) => Spot.point(prev.container, prev.container.data.length));
  }
};

const textAfter = (node: Node, offset: number, rootNode: Node): Option<Spot.SpotPoint<Text>> => {
  if (isText(node) && offset >= node.length) {
    return Option.some(Spot.point(node, offset));
  } else {
    const textSeeker = TextSeeker(DOM);
    return Option.from(textSeeker.forwards(node, offset, alwaysNext(node), rootNode)).map((prev) => Spot.point(prev.container, 0));
  }
};

const scanLeft = (node: Text, offset: number, rootNode: Node): Option<Spot.SpotPoint<Text>> => {
  if (!isText(node)) {
    return Option.none();
  }
  const text = node.textContent;
  if (offset >= 0 && offset <= text.length) {
    return Option.some(Spot.point(node, offset));
  } else {
    const textSeeker = TextSeeker(DOM);
    return Option.from(textSeeker.backwards(node, offset, alwaysNext(node), rootNode)).bind((prev) => {
      const prevText = prev.container.data;
      return scanLeft(prev.container, offset + prevText.length, rootNode);
    });
  }
};

const scanRight = (node: Text, offset: number, rootNode: Node): Option<Spot.SpotPoint<Text>> => {
  if (!isText(node)) {
    return Option.none();
  }
  const text = node.textContent;
  if (offset <= text.length) {
    return Option.some(Spot.point(node, offset));
  } else {
    const textSeeker = TextSeeker(DOM);
    return Option.from(textSeeker.forwards(node, offset, alwaysNext(node), rootNode)).bind((next) => scanRight(next.container, offset - text.length, rootNode));
  }
};

const repeatLeft = (dom: DOMUtils, node: Node, offset: number, process: ProcessCallback, rootNode: Node): Option<Spot.SpotPoint<Text>> => {
  const search = TextSeeker(dom, isBoundary(dom));
  return Option.from(search.backwards(node, offset, process, rootNode));
};

const repeatRight = (dom: DOMUtils, node: Node, offset: number, process: ProcessCallback, rootNode: Node): Option<Spot.SpotPoint<Text>> => {
  const search = TextSeeker(dom, isBoundary(dom));
  return Option.from(search.forwards(node, offset, process, rootNode));
};

export {
  repeatLeft,
  repeatRight,
  scanLeft,
  scanRight,
  textBefore,
  textAfter
};
