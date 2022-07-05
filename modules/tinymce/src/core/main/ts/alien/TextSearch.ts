import { Arr, Optional } from '@ephox/katamari';

import DOMUtils from '../api/dom/DOMUtils';
import TextSeeker from '../api/dom/TextSeeker';
import * as NodeType from '../dom/NodeType';
import * as Spot from './Spot';

const DOM = DOMUtils.DOM;

export type ProcessCallback = (element: Text, offset: number, text: string) => number;

const alwaysNext = (startNode: Node) => (node: Node): number =>
  startNode === node ? -1 : 0;

// This largely is derived from robins isBoundary check, however it also treats contenteditable=false elements as a boundary
// See robins `Structure.isEmptyTag` for the list of quasi block elements
const isBoundary = (dom: DOMUtils) => (node: Node): boolean =>
  dom.isBlock(node) || Arr.contains([ 'BR', 'IMG', 'HR', 'INPUT' ], node.nodeName) || dom.getContentEditable(node) === 'false';

// Finds the text node before the specified node, or just returns the node if it's already on a text node
const textBefore = (node: Node, offset: number, rootNode: Node): Optional<Spot.SpotPoint<Text>> => {
  if (NodeType.isText(node) && offset >= 0) {
    return Optional.some(Spot.point(node, offset));
  } else {
    const textSeeker = TextSeeker(DOM);
    return Optional.from(textSeeker.backwards(node, offset, alwaysNext(node), rootNode)).map((prev) => Spot.point(prev.container, prev.container.data.length));
  }
};

const textAfter = (node: Node, offset: number, rootNode: Node): Optional<Spot.SpotPoint<Text>> => {
  if (NodeType.isText(node) && offset >= node.length) {
    return Optional.some(Spot.point(node, offset));
  } else {
    const textSeeker = TextSeeker(DOM);
    return Optional.from(textSeeker.forwards(node, offset, alwaysNext(node), rootNode)).map((prev) => Spot.point(prev.container, 0));
  }
};

const scanLeft = (node: Text, offset: number, rootNode: Node): Optional<Spot.SpotPoint<Text>> => {
  if (!NodeType.isText(node)) {
    return Optional.none();
  }
  const text = node.data;
  if (offset >= 0 && offset <= text.length) {
    return Optional.some(Spot.point(node, offset));
  } else {
    const textSeeker = TextSeeker(DOM);
    return Optional.from(textSeeker.backwards(node, offset, alwaysNext(node), rootNode)).bind((prev) => {
      const prevText = prev.container.data;
      return scanLeft(prev.container, offset + prevText.length, rootNode);
    });
  }
};

const scanRight = (node: Text, offset: number, rootNode: Node): Optional<Spot.SpotPoint<Text>> => {
  if (!NodeType.isText(node)) {
    return Optional.none();
  }
  const text = node.data;
  if (offset <= text.length) {
    return Optional.some(Spot.point(node, offset));
  } else {
    const textSeeker = TextSeeker(DOM);
    return Optional.from(textSeeker.forwards(node, offset, alwaysNext(node), rootNode)).bind((next) => scanRight(next.container, offset - text.length, rootNode));
  }
};

const repeatLeft = (dom: DOMUtils, node: Node, offset: number, process: ProcessCallback, rootNode?: Node): Optional<Spot.SpotPoint<Text>> => {
  const search = TextSeeker(dom, isBoundary(dom));
  return Optional.from(search.backwards(node, offset, process, rootNode));
};

const repeatRight = (dom: DOMUtils, node: Node, offset: number, process: ProcessCallback, rootNode?: Node): Optional<Spot.SpotPoint<Text>> => {
  const search = TextSeeker(dom, isBoundary(dom));
  return Optional.from(search.forwards(node, offset, process, rootNode));
};

export {
  repeatLeft,
  repeatRight,
  scanLeft,
  scanRight,
  textBefore,
  textAfter
};
