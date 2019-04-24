/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { HTMLElement, Node, Range, Text } from '@ephox/dom-globals';
import { Arr, Fun, Obj, Option, Type } from '@ephox/katamari';
import { SpotPoint, Spot, DomGather, DomDescent } from '@ephox/phoenix';
import { Element, Node as SugarNode, NodeTypes, Text as SugarText } from '@ephox/sugar';
import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import Formatter from 'tinymce/core/api/Formatter';

const isElement = (node: Node): node is HTMLElement => node.nodeType === NodeTypes.ELEMENT;
const isText = (node: Node): node is Text => node.nodeType === NodeTypes.TEXT;

const cleanEmptyNodes = (dom: DOMUtils, node: Node, isRoot: (e: Node) => boolean) => {
  // Recursively walk up the tree while we have a parent and the node is empty. If the node is empty, then remove it.
  if (node && dom.isEmpty(node) && !isRoot(node)) {
    const parent = node.parentNode;
    dom.remove(node);
    cleanEmptyNodes(dom, parent, isRoot);
  }
};

const deleteRng = (dom: DOMUtils, rng: Range, isRoot: (e: Node) => boolean, clean = true) => {
  const startParent = rng.startContainer.parentNode;
  const endParent = rng.endContainer.parentNode;
  rng.deleteContents();

  // Clean up any empty nodes if required
  if (clean && !isRoot(rng.startContainer)) {
    if (isText(rng.startContainer) && rng.startContainer.data.length === 0) {
      dom.remove(rng.startContainer);
    }
    if (isText(rng.endContainer) && rng.endContainer.data.length === 0) {
      dom.remove(rng.endContainer);
    }
    cleanEmptyNodes(dom, startParent, isRoot);
    if (startParent !== endParent) {
      cleanEmptyNodes(dom, endParent, isRoot);
    }
  }
};

const isBlockFormatName = (name: string, formatter: Formatter): boolean => {
  const formatSet = formatter.get(name);
  return Type.isArray(formatSet) && Arr.head(formatSet).exists((format) => Obj.has(format as any, 'block'));
};

const textBefore = (node: Node, offset: number, isRoot: (e: Element) => boolean = Fun.constant(false)): Option<SpotPoint<Text>> => {
  if (isText(node) && offset > 0) {
    return Option.some(Spot.point(node, offset));
  } else {
    const spot = DomDescent.toLeaf(Element.fromDom(node), offset);
    if (isText(spot.element().dom())) {
      return Option.some(Spot.point(spot.element().dom(), spot.offset()));
    } else {
      return DomGather.before(spot.element(), isRoot).map((e) => {
        return Spot.point(e.dom(), e.dom().length);
      });
    }
  }
};

// TODO: Should this be in robin?
const scanLeft = (node: Element, offset: number, isRoot): Option<SpotPoint<Element>> => {
  if (!SugarNode.isText(node)) {
    return Option.none();
  }
  const text = SugarText.get(node);
  if (offset >= 0 && offset <= text.length) {
    return Option.some(Spot.point(node, offset));
  } else {
    return DomGather.seekLeft(node, SugarNode.isText, isRoot).bind((prev) => {
      const text = SugarText.get(prev);
      return scanLeft(prev, offset + text.length, isRoot);
    });
  }
};

const leanLeft = (node: Text, offset: number, isRoot: (e: Element) => boolean): Option<SpotPoint<Text>> => {
  if (offset < 0) {
    return scanLeft(Element.fromDom(node), offset, isRoot).map((e) => {
      return Spot.point(e.element().dom(), e.offset());
    });
  } else {
    return Option.some(Spot.point(node, offset));
  }
};

export {
  cleanEmptyNodes,
  deleteRng,
  isBlockFormatName,
  isElement,
  isText,
  leanLeft,
  textBefore
};