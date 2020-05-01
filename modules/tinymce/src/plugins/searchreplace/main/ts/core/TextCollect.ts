/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Node, Range, Text } from '@ephox/dom-globals';
import { Arr, Fun, Obj } from '@ephox/katamari';
import { Element, Traverse } from '@ephox/sugar';
import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import TreeWalker from 'tinymce/core/api/dom/TreeWalker';
import { TextSection } from './Types';

const isBoundary = (dom: DOMUtils, node: Node) => dom.isBlock(node) || Obj.has(dom.schema.getShortEndedElements(), node.nodeName);
const isContentEditableFalse = (dom: DOMUtils, node: Node) => dom.getContentEditable(node) === 'false';
const isHidden = (dom: DOMUtils, node: Node) => !dom.isBlock(node) && Obj.has(dom.schema.getWhiteSpaceElements(), node.nodeName);
const isText = (node: Node): node is Text => node.nodeType === 3;

const nuSection = (): TextSection => ({
  sOffset: 0,
  fOffset: 0,
  elements: []
});

const walk = (dom: DOMUtils, walkerFn: (shallow?: boolean) => Node, boundary: (node: Node) => boolean, text: (text: Text) => void, startNode: Node, endNode?: Node, skipStart: boolean = true) => {
  let next = skipStart ? walkerFn(false) : startNode;
  while (next) {
    // Walk over content editable or hidden elements
    if (isHidden(dom, next) || isContentEditableFalse(dom, next)) {
      if (boundary(next)) {
        break;
      } else {
        next = walkerFn(true);
        continue;
      }
    } else if (isBoundary(dom, next)) {
      if (boundary(next)) {
        break;
      }
    } else if (isText(next)) {
      text(next);
    }

    if (next === endNode) {
      break;
    } else {
      next = walkerFn(false);
    }
  }
};

const collectTextToBoundary = (dom: DOMUtils, section: TextSection, node: Node, rootNode: Node, forwards: boolean) => {
  // Don't bother collecting text nodes if we're already at a boundary
  if (isBoundary(dom, node)) {
    return;
  }

  const rootBlock = dom.getParent(rootNode, dom.isBlock);
  const walker = new TreeWalker(node, rootBlock);
  const walkerFn = forwards ? walker.next : walker.prev;

  // Walk over and add text nodes to the section and increase the offsets
  // so we know to ignore the additional text when matching
  walk(dom, walkerFn, Fun.always, (next) => {
    if (forwards) {
      section.fOffset += next.length;
    } else {
      section.sOffset += next.length;
    }
    section.elements.push(Element.fromDom(next));
  }, node);
};

const collectSections = (dom: DOMUtils, startNode: Node, startOffset: number, endNode: Node, endOffset: number, rootNode: Node): TextSection[] => {
  const walker = new TreeWalker(startNode, rootNode);
  const sections: TextSection[] = [];
  let current: TextSection = nuSection();

  // Find any text between the start node and the closest boundary
  collectTextToBoundary(dom, current, startNode, rootNode, false);

  const finishSection = () => {
    if (current.elements.length > 0) {
      sections.push(current);
      current = nuSection();
    }
    return false;
  };

  // Collect all the text nodes in the specified range and create sections from the
  // boundaries within the range
  walk(dom, walker.next, finishSection, (next) => {
    if (next === endNode) {
      current.fOffset += next.length - endOffset;
    } else if (next === startNode) {
      current.sOffset += startOffset;
    }
    current.elements.push(Element.fromDom(next));
  }, startNode, endNode, false);

  // Find any text between the end node and the closest boundary, then finalise the section
  collectTextToBoundary(dom, current, endNode, rootNode, true);
  finishSection();

  return sections;
};

const fromRng = (dom: DOMUtils, rng: Range): TextSection[] => {
  if (rng.collapsed) {
    return [];
  } else {
    const toLeaf = (node: Node, offset: number) => Traverse.leaf(Element.fromDom(node), offset);
    const start = toLeaf(rng.startContainer, rng.startOffset);
    const end = toLeaf(rng.endContainer, rng.endOffset);
    return collectSections(dom, start.element().dom(), start.offset(), end.element().dom(), end.offset(), rng.commonAncestorContainer);
  }
};

const fromNode = (dom: DOMUtils, node: Node): TextSection[] => {
  const rng = dom.createRng();
  rng.selectNode(node);
  return fromRng(dom, rng);
};

const fromNodes = (dom: DOMUtils, nodes: Node[]): TextSection[] => Arr.bind(nodes, (node) => fromNode(dom, node));

export {
  fromNode,
  fromNodes,
  fromRng
};
