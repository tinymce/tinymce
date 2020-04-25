/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Node, Range, Text } from '@ephox/dom-globals';
import { Arr, Obj } from '@ephox/katamari';
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

const collectSections = (dom: DOMUtils, startNode: Node, startOffset: number, endNode: Node, endOffset: number, rootNode: Node): TextSection[] => {
  const walker = new TreeWalker(startNode, rootNode);
  const sections: TextSection[] = [];
  let current: TextSection = nuSection();

  const finishSection = () => {
    if (current.elements.length > 0) {
      sections.push(current);
      current = nuSection();
    }
  };

  let next = startNode;
  while (next) {
    if (isHidden(dom, next) || isContentEditableFalse(dom, next)) {
      next = walker.next(true);
      finishSection();
      continue;
    } else if (isBoundary(dom, next)) {
      finishSection();
    } else if (isText(next)) {
      if (next === endNode) {
        current.fOffset = next.length - endOffset;
      } else if (next === startNode) {
        current.sOffset = startOffset;
      }
      current.elements.push(Element.fromDom(next));
    }

    if (next === endNode) {
      break;
    } else {
      next = walker.next(false);
    }
  }

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
