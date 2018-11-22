/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Fun, Option, Options } from '@ephox/katamari';
import { Compare, Element, Node, Traverse } from '@ephox/sugar';
import NodeType from '../dom/NodeType';
import Env from '../api/Env';
import TreeWalker from '../api/dom/TreeWalker';
import Tools from '../api/util/Tools';
import { Editor } from 'tinymce/core/api/Editor';
import { Range } from '@ephox/dom-globals';

const getStartNode = function (rng) {
  const sc = rng.startContainer, so = rng.startOffset;
  if (NodeType.isText(sc)) {
    return so === 0 ? Option.some(Element.fromDom(sc)) : Option.none();
  } else {
    return Option.from(sc.childNodes[so]).map(Element.fromDom);
  }
};

const getEndNode = function (rng) {
  const ec = rng.endContainer, eo = rng.endOffset;
  if (NodeType.isText(ec)) {
    return eo === ec.data.length ? Option.some(Element.fromDom(ec)) : Option.none();
  } else {
    return Option.from(ec.childNodes[eo - 1]).map(Element.fromDom);
  }
};

const getFirstChildren = function (node) {
  return Traverse.firstChild(node).fold(
    Fun.constant([node]),
    function (child) {
      return [node].concat(getFirstChildren(child));
    }
  );
};

const getLastChildren = function (node) {
  return Traverse.lastChild(node).fold(
    Fun.constant([node]),
    function (child) {
      if (Node.name(child) === 'br') {
        return Traverse.prevSibling(child).map(function (sibling) {
          return [node].concat(getLastChildren(sibling));
        }).getOr([]);
      } else {
        return [node].concat(getLastChildren(child));
      }
    }
  );
};

const hasAllContentsSelected = function (elm, rng) {
  return Options.liftN([getStartNode(rng), getEndNode(rng)], function (startNode, endNode) {
    const start = Arr.find(getFirstChildren(elm), Fun.curry(Compare.eq, startNode));
    const end = Arr.find(getLastChildren(elm), Fun.curry(Compare.eq, endNode));
    return start.isSome() && end.isSome();
  }).getOr(false);
};

const moveEndPoint = (dom, rng: Range, node, start: boolean): void => {
  const root = node, walker = new TreeWalker(node, root);
  const nonEmptyElementsMap = dom.schema.getNonEmptyElements();

  do {
    // Text node
    if (node.nodeType === 3 && Tools.trim(node.nodeValue).length !== 0) {
      if (start) {
        rng.setStart(node, 0);
      } else {
        rng.setEnd(node, node.nodeValue.length);
      }

      return;
    }

    // BR/IMG/INPUT elements but not table cells
    if (nonEmptyElementsMap[node.nodeName] && !/^(TD|TH)$/.test(node.nodeName)) {
      if (start) {
        rng.setStartBefore(node);
      } else {
        if (node.nodeName === 'BR') {
          rng.setEndBefore(node);
        } else {
          rng.setEndAfter(node);
        }
      }

      return;
    }

    // Found empty text block old IE can place the selection inside those
    if (Env.ie && Env.ie < 11 && dom.isBlock(node) && dom.isEmpty(node)) {
      if (start) {
        rng.setStart(node, 0);
      } else {
        rng.setEnd(node, 0);
      }

      return;
    }
  } while ((node = (start ? walker.next() : walker.prev())));

  // Failed to find any text node or other suitable location then move to the root of body
  if (root.nodeName === 'BODY') {
    if (start) {
      rng.setStart(root, 0);
    } else {
      rng.setEnd(root, root.childNodes.length);
    }
  }
};

const hasAnyRanges = (editor: Editor) => {
  const sel = editor.selection.getSel();
  return sel && sel.rangeCount > 0;
};

export {
  hasAllContentsSelected,
  moveEndPoint,
  hasAnyRanges
};