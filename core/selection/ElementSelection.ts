/**
 * ElementSelection.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { Option } from '@ephox/katamari';
import { Node, Traverse, Element } from '@ephox/sugar';
import TreeWalker from '../api/dom/TreeWalker';
import { moveEndPoint } from './SelectionUtils';
import NodeType from '../dom/NodeType';

const getEndpointElement = (root: Element, rng: Range, start: boolean, real: boolean, resolve: (elm, offset: number) => number) => {
  const container = start ? rng.startContainer : rng.endContainer;
  const offset = start ? rng.startOffset : rng.endOffset;

  return Option.from(container).map(Element.fromDom).map((elm) => {
    return !real || !rng.collapsed ? Traverse.child(elm, resolve(elm, offset)).getOr(elm) : elm;
  }).bind((elm) => Node.isElement(elm) ? Option.some(elm) : Traverse.parent(elm)).map((elm: any) => elm.dom()).getOr(root);
};

const getStart = (root: Element, rng: Range, real?: boolean): Element => {
  return getEndpointElement(root, rng, true, real, (elm, offset) => Math.min(Traverse.childNodesCount(elm), offset));
};

const getEnd = (root: Element, rng: Range, real?: boolean): Element => {
  return getEndpointElement(root, rng, false, real, (elm, offset) => offset > 0 ? offset - 1 : offset);
};

const skipEmptyTextNodes = function (node: Node, forwards: boolean) {
  const orig = node;

  while (node && NodeType.isText(node) && node.length === 0) {
    node = forwards ? node.nextSibling : node.previousSibling;
  }

  return node || orig;
};

const getNode = (root: Element, rng: Range): Element => {
  let elm, startContainer, endContainer, startOffset, endOffset;

  // Range maybe lost after the editor is made visible again
  if (!rng) {
    return root;
  }

  startContainer = rng.startContainer;
  endContainer = rng.endContainer;
  startOffset = rng.startOffset;
  endOffset = rng.endOffset;
  elm = rng.commonAncestorContainer;

  // Handle selection a image or other control like element such as anchors
  if (!rng.collapsed) {
    if (startContainer === endContainer) {
      if (endOffset - startOffset < 2) {
        if (startContainer.hasChildNodes()) {
          elm = startContainer.childNodes[startOffset];
        }
      }
    }

    // If the anchor node is a element instead of a text node then return this element
    // if (tinymce.isWebKit && sel.anchorNode && sel.anchorNode.nodeType == 1)
    // return sel.anchorNode.childNodes[sel.anchorOffset];

    // Handle cases where the selection is immediately wrapped around a node and return that node instead of it's parent.
    // This happens when you double click an underlined word in FireFox.
    if (startContainer.nodeType === 3 && endContainer.nodeType === 3) {
      if (startContainer.length === startOffset) {
        startContainer = skipEmptyTextNodes(startContainer.nextSibling, true);
      } else {
        startContainer = startContainer.parentNode;
      }

      if (endOffset === 0) {
        endContainer = skipEmptyTextNodes(endContainer.previousSibling, false);
      } else {
        endContainer = endContainer.parentNode;
      }

      if (startContainer && startContainer === endContainer) {
        return startContainer;
      }
    }
  }

  if (elm && elm.nodeType === 3) {
    return elm.parentNode;
  }

  return elm;
};

const getSelectedBlocks = (dom, rng: Range, startElm?: Element, endElm?: Element): Element[] => {
  let node, root;
  const selectedBlocks = [];

  root = dom.getRoot();
  startElm = dom.getParent(startElm || getStart(root, rng, false), dom.isBlock);
  endElm = dom.getParent(endElm || getEnd(root, rng, false), dom.isBlock);

  if (startElm && startElm !== root) {
    selectedBlocks.push(startElm);
  }

  if (startElm && endElm && startElm !== endElm) {
    node = startElm;

    const walker = new TreeWalker(startElm, root);
    while ((node = walker.next()) && node !== endElm) {
      if (dom.isBlock(node)) {
        selectedBlocks.push(node);
      }
    }
  }

  if (endElm && startElm !== endElm && endElm !== root) {
    selectedBlocks.push(endElm);
  }

  return selectedBlocks;
};

const select = (dom, node: Node, content?: boolean) => {
  return Option.from(node).map((node) => {
    const idx = dom.nodeIndex(node);
    const rng = dom.createRng();

    rng.setStart(node.parentNode, idx);
    rng.setEnd(node.parentNode, idx + 1);

    // Find first/last text node or BR element
    if (content) {
      moveEndPoint(dom, rng, node, true);
      moveEndPoint(dom, rng, node, false);
    }

    return rng;
  });
};

export {
  getStart,
  getEnd,
  getNode,
  getSelectedBlocks,
  select
};
