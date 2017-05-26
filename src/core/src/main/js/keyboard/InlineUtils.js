/**
 * InlineUtils.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.keyboard.InlineUtils',
  [
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Option',
    'ephox.katamari.api.Options',
    'tinymce.core.caret.CaretContainer',
    'tinymce.core.caret.CaretFinder',
    'tinymce.core.caret.CaretPosition',
    'tinymce.core.caret.CaretUtils',
    'tinymce.core.caret.CaretWalker',
    'tinymce.core.dom.DOMUtils',
    'tinymce.core.dom.NodeType',
    'tinymce.core.text.Bidi'
  ],
  function (Arr, Fun, Option, Options, CaretContainer, CaretFinder, CaretPosition, CaretUtils, CaretWalker, DOMUtils, NodeType, Bidi) {
    var isInlineTarget = function (elm) {
      return DOMUtils.DOM.is(elm, 'a[href],code');
    };

    var isRtl = function (element) {
      return DOMUtils.DOM.getStyle(element, 'direction', true) === 'rtl' || Bidi.hasStrongRtl(element.textContent);
    };

    var findInlineParents = function (rootNode, pos) {
      return Arr.filter(DOMUtils.DOM.getParents(pos.container(), '*', rootNode), isInlineTarget);
    };

    var findInline = function (rootNode, pos) {
      var parents = findInlineParents(rootNode, pos);
      return Option.from(parents[0]);
    };

    var findRootInline = function (rootNode, pos) {
      var parents = findInlineParents(rootNode, pos);
      return Option.from(parents[parents.length - 1]);
    };

    var hasSameParentBlock = function (rootNode, node1, node2) {
      var block1 = CaretUtils.getParentBlock(node1, rootNode);
      var block2 = CaretUtils.getParentBlock(node2, rootNode);
      return block1 && block1 === block2;
    };

    var isInInline = function (rootNode, pos) {
      return pos ? findRootInline(rootNode, pos).isSome() : false;
    };

    var isAtInlineEndPoint = function (rootNode, pos) {
      return findRootInline(rootNode, pos).map(function (inline) {
        return findCaretPosition(inline, false, pos).isNone() || findCaretPosition(inline, true, pos).isNone();
      }).getOr(false);
    };

    var isAtZwsp = function (pos) {
      return CaretContainer.isBeforeInline(pos) || CaretContainer.isAfterInline(pos);
    };

    var findCaretPositionIn = function (node, forward) {
      return CaretFinder.positionIn(forward, node);
    };

    var findCaretPosition = function (rootNode, forward, from) {
      return CaretFinder.fromPosition(forward, rootNode, from);
    };

    var normalizePosition = function (forward, pos) {
      var container = pos.container(), offset = pos.offset();

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

    var normalizeForwards = Fun.curry(normalizePosition, true);
    var normalizeBackwards = Fun.curry(normalizePosition, false);

    return {
      isInlineTarget: isInlineTarget,
      findInline: findInline,
      findRootInline: findRootInline,
      isInInline: isInInline,
      isRtl: isRtl,
      isAtInlineEndPoint: isAtInlineEndPoint,
      isAtZwsp: isAtZwsp,
      findCaretPositionIn: findCaretPositionIn,
      findCaretPosition: findCaretPosition,
      normalizePosition: normalizePosition,
      normalizeForwards: normalizeForwards,
      normalizeBackwards: normalizeBackwards,
      hasSameParentBlock: hasSameParentBlock
    };
  }
);