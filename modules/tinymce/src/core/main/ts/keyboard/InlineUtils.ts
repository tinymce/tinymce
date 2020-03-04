/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Node } from '@ephox/dom-globals';
import { Arr, Fun, Option } from '@ephox/katamari';
import { Element, Selectors } from '@ephox/sugar';
import * as CaretContainer from '../caret/CaretContainer';
import CaretPosition from '../caret/CaretPosition';
import * as CaretUtils from '../caret/CaretUtils';
import DOMUtils from '../api/dom/DOMUtils';
import * as NodeType from '../dom/NodeType';
import * as Bidi from '../text/Bidi';
import Editor from '../api/Editor';
import * as Settings from '../api/Settings';

const isInlineTarget = function (editor: Editor, elm: Node): boolean {
  return Selectors.is(Element.fromDom(elm), Settings.getInlineBoundarySelector(editor));
};

const isRtl = function (element: Node) {
  return DOMUtils.DOM.getStyle(element, 'direction', true) === 'rtl' || Bidi.hasStrongRtl(element.textContent);
};

const findInlineParents = function (isInlineTarget: (node: Node) => boolean, rootNode: Node, pos: CaretPosition) {
  return Arr.filter(DOMUtils.DOM.getParents(pos.container(), '*', rootNode), isInlineTarget);
};

const findRootInline = function (isInlineTarget: (node: Node) => boolean, rootNode: Node, pos: CaretPosition) {
  const parents = findInlineParents(isInlineTarget, rootNode, pos);
  return Option.from(parents[parents.length - 1]);
};

const hasSameParentBlock = function (rootNode: Node, node1: Node, node2: Node) {
  const block1 = CaretUtils.getParentBlock(node1, rootNode);
  const block2 = CaretUtils.getParentBlock(node2, rootNode);
  return block1 && block1 === block2;
};

const isAtZwsp = function (pos: CaretPosition) {
  return CaretContainer.isBeforeInline(pos) || CaretContainer.isAfterInline(pos);
};

const normalizePosition = function (forward: boolean, pos: CaretPosition) {
  if (!pos) {
    return pos;
  }

  const container = pos.container(), offset = pos.offset();

  if (forward) {
    if (CaretContainer.isCaretContainerInline(container)) {
      if (NodeType.isText(container.nextSibling)) {
        return CaretPosition(container.nextSibling, 0);
      } else {
        return CaretPosition.after(container);
      }
    } else {
      return CaretContainer.isBeforeInline(pos) ? CaretPosition(container, offset + 1) : pos;
    }
  } else {
    if (CaretContainer.isCaretContainerInline(container)) {
      if (NodeType.isText(container.previousSibling)) {
        return CaretPosition(container.previousSibling, container.previousSibling.data.length);
      } else {
        return CaretPosition.before(container);
      }
    } else {
      return CaretContainer.isAfterInline(pos) ? CaretPosition(container, offset - 1) : pos;
    }
  }
};

type NormalisePostionFn = (pos: CaretPosition) => CaretPosition;

const normalizeForwards = Fun.curry(normalizePosition, true) as NormalisePostionFn;
const normalizeBackwards = Fun.curry(normalizePosition, false) as NormalisePostionFn;

export {
  isInlineTarget,
  findRootInline,
  isRtl,
  isAtZwsp,
  normalizePosition,
  normalizeForwards,
  normalizeBackwards,
  hasSameParentBlock
};
