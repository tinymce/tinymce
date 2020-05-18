/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Node, Range, Text } from '@ephox/dom-globals';
import { Arr, Fun, Obj } from '@ephox/katamari';
import { Node as SandNode } from '@ephox/sand';
import { Element, SelectorFilter, Traverse } from '@ephox/sugar';
import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import TreeWalker from 'tinymce/core/api/dom/TreeWalker';
import { TextSection } from './Types';

interface WalkerCallbacks {
  boundary: (node: Node) => boolean;
  cef: (node: Node) => boolean;
  text: (node: Text) => void;
}

interface CollectCallbacks {
  cef: (node: Node) => TextSection[];
  text: (node: Text, section: TextSection) => void;
}

const isSimpleBoundary = (dom: DOMUtils, node: Node) => dom.isBlock(node) || Obj.has(dom.schema.getShortEndedElements(), node.nodeName);
const isContentEditableFalse = (dom: DOMUtils, node: Node) => dom.getContentEditable(node) === 'false';
const isContentEditableTrueInCef = (dom: DOMUtils, node: Node) => dom.getContentEditable(node) === 'true' && dom.getContentEditableParent(node.parentNode) === 'false';
const isHidden = (dom: DOMUtils, node: Node) => !dom.isBlock(node) && Obj.has(dom.schema.getWhiteSpaceElements(), node.nodeName);
const isBoundary = (dom: DOMUtils, node: Node) => isSimpleBoundary(dom, node) || isContentEditableFalse(dom, node) || isHidden(dom, node) || isContentEditableTrueInCef(dom, node);
const isText = (node: Node): node is Text => node.nodeType === 3;

const nuSection = (): TextSection => ({
  sOffset: 0,
  fOffset: 0,
  elements: []
});

const toLeaf = (node: Node, offset: number) => Traverse.leaf(Element.fromDom(node), offset);

const walk = (dom: DOMUtils, walkerFn: (shallow?: boolean) => Node, startNode: Node, callbacks: WalkerCallbacks, endNode?: Node, skipStart: boolean = true) => {
  let next = skipStart ? walkerFn(false) : startNode;
  while (next) {
    // Walk over content editable or hidden elements
    const isCefNode = isContentEditableFalse(dom, next);
    if (isCefNode || isHidden(dom, next)) {
      const stopWalking = isCefNode ? callbacks.cef(next) : callbacks.boundary(next);
      if (stopWalking) {
        break;
      } else {
        next = walkerFn(true);
        continue;
      }
    } else if (isSimpleBoundary(dom, next)) {
      if (callbacks.boundary(next)) {
        break;
      }
    } else if (isText(next)) {
      callbacks.text(next);
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
  walk(dom, walkerFn, node, {
    boundary: Fun.always,
    cef: Fun.always,
    text: (next) => {
      if (forwards) {
        section.fOffset += next.length;
      } else {
        section.sOffset += next.length;
      }
      section.elements.push(Element.fromDom(next));
    }
  });
};

const collect = (dom: DOMUtils, rootNode: Node, startNode: Node, endNode?: Node, callbacks?: CollectCallbacks, skipStart: boolean = true) => {
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
  walk(dom, walker.next, startNode, {
    boundary: finishSection,
    cef: (node) => {
      finishSection();
      // Collect additional nested contenteditable true content
      if (callbacks) {
        sections.push(...callbacks.cef(node));
      }
      return false;
    },
    text: (next) => {
      current.elements.push(Element.fromDom(next));
      if (callbacks) {
        callbacks.text(next, current);
      }
    }
  }, endNode, skipStart);

  // Find any text between the end node and the closest boundary, then finalise the section
  if (endNode) {
    collectTextToBoundary(dom, current, endNode, rootNode, true);
  }
  finishSection();

  return sections;
};

const collectRangeSections = (dom: DOMUtils, rng: Range): TextSection[] => {
  const start = toLeaf(rng.startContainer, rng.startOffset);
  const startNode = start.element().dom();
  const end = toLeaf(rng.endContainer, rng.endOffset);
  const endNode = end.element().dom();

  return collect(dom, rng.commonAncestorContainer, startNode, endNode, {
    text: (node, section) => {
      // Set the start/end offset of the section
      if (node === endNode) {
        section.fOffset += node.length - end.offset();
      } else if (node === startNode) {
        section.sOffset += start.offset();
      }
    },
    cef: (node) => {
      // Collect the sections and then order them appropriately, as nested sections maybe out of order
      // TODO: See if we can improve this to avoid the sort overhead
      const sections = Arr.bind(SelectorFilter.descendants(Element.fromDom(node), '*[contenteditable=true]'), (e) => {
        const ceTrueNode = e.dom();
        return collect(dom, ceTrueNode, ceTrueNode);
      });
      return Arr.sort(sections, (a, b) => (SandNode.documentPositionPreceding(a.elements[0].dom(), b.elements[0].dom())) ? 1 : -1);
    }
  }, false);
};

const fromRng = (dom: DOMUtils, rng: Range): TextSection[] => rng.collapsed ? [] : collectRangeSections(dom, rng);

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
