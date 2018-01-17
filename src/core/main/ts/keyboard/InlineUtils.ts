/**
 * InlineUtils.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { Arr } from '@ephox/katamari';
import { Fun } from '@ephox/katamari';
import { Option } from '@ephox/katamari';
import { Element } from '@ephox/sugar';
import { Selectors } from '@ephox/sugar';
import * as EditorSettings from '../EditorSettings';
import CaretContainer from '../caret/CaretContainer';
import CaretPosition from '../caret/CaretPosition';
import CaretUtils from '../caret/CaretUtils';
import DOMUtils from '../dom/DOMUtils';
import NodeType from '../dom/NodeType';
import Bidi from '../text/Bidi';

const isInlineTarget = function (editor, elm) {
  const selector = EditorSettings.getString(editor, 'inline_boundaries_selector').getOr('a[href],code');
  return Selectors.is(Element.fromDom(elm), selector);
};

const isRtl = function (element) {
  return DOMUtils.DOM.getStyle(element, 'direction', true) === 'rtl' || Bidi.hasStrongRtl(element.textContent);
};

const findInlineParents = function (isInlineTarget, rootNode, pos) {
  return Arr.filter(DOMUtils.DOM.getParents(pos.container(), '*', rootNode), isInlineTarget);
};

const findRootInline = function (isInlineTarget, rootNode, pos) {
  const parents = findInlineParents(isInlineTarget, rootNode, pos);
  return Option.from(parents[parents.length - 1]);
};

const hasSameParentBlock = function (rootNode, node1, node2) {
  const block1 = CaretUtils.getParentBlock(node1, rootNode);
  const block2 = CaretUtils.getParentBlock(node2, rootNode);
  return block1 && block1 === block2;
};

const isAtZwsp = function (pos) {
  return CaretContainer.isBeforeInline(pos) || CaretContainer.isAfterInline(pos);
};

const normalizePosition = function (forward, pos) {
  const container = pos.container(), offset = pos.offset();

  if (forward) {
    if (CaretContainer.isCaretContainerInline(container)) {
      if (NodeType.isText(container.nextSibling)) {
        return new CaretPosition(container.nextSibling, 0);
      } else {
        return CaretPosition.after(container);
      }
    } else {
      return CaretContainer.isBeforeInline(pos) ? new CaretPosition(container, offset + 1) : pos;
    }
  } else {
    if (CaretContainer.isCaretContainerInline(container)) {
      if (NodeType.isText(container.previousSibling)) {
        return new CaretPosition(container.previousSibling, container.previousSibling.data.length);
      } else {
        return CaretPosition.before(container);
      }
    } else {
      return CaretContainer.isAfterInline(pos) ? new CaretPosition(container, offset - 1) : pos;
    }
  }
};

const normalizeForwards = Fun.curry(normalizePosition, true);
const normalizeBackwards = Fun.curry(normalizePosition, false);

export default {
  isInlineTarget,
  findRootInline,
  isRtl,
  isAtZwsp,
  normalizePosition,
  normalizeForwards,
  normalizeBackwards,
  hasSameParentBlock
};