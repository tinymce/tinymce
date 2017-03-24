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
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Option',
    'ephox.katamari.api.Options',
    'tinymce.core.caret.CaretContainer',
    'tinymce.core.caret.CaretFinder',
    'tinymce.core.caret.CaretPosition',
    'tinymce.core.caret.CaretUtils',
    'tinymce.core.caret.CaretWalker',
    'tinymce.core.dom.DOMUtils',
    'tinymce.core.text.Bidi'
  ],
  function (Fun, Option, Options, CaretContainer, CaretFinder, CaretPosition, CaretUtils, CaretWalker, DOMUtils, Bidi) {
    var isInlineTarget = function (elm) {
      return DOMUtils.DOM.is(elm, 'a[href],code');
    };

    var isRtl = function (element) {
      return DOMUtils.DOM.getStyle(element, 'direction', true) === 'rtl' || Bidi.hasStrongRtl(element.textContent);
    };

    var findInline = function (rootNode, pos) {
      return Option.from(DOMUtils.DOM.getParent(pos.container(), isInlineTarget, rootNode));
    };

    var hasSameParentBlock = function (rootNode, node1, node2) {
      var block1 = CaretUtils.getParentBlock(node1, rootNode);
      var block2 = CaretUtils.getParentBlock(node2, rootNode);
      return block1 && block1 === block2;
    };

    var isInInline = function (rootNode, pos) {
      return pos ? findInline(rootNode, pos).isSome() : false;
    };

    var isAtInlineEndPoint = function (rootNode, pos) {
      return findInline(rootNode, pos).map(function (inline) {
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
        return CaretContainer.isBeforeInline(pos) ? new CaretPosition(container, offset + 1) : pos;
      } else {
        return CaretContainer.isAfterInline(pos) ? new CaretPosition(container, offset - 1) : pos;
      }
    };

    var normalizeForwards = Fun.curry(normalizePosition, true);
    var normalizeBackwards = Fun.curry(normalizePosition, false);

    return {
      isInlineTarget: isInlineTarget,
      findInline: findInline,
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