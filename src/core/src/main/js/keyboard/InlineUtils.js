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
    'tinymce.core.caret.CaretPosition',
    'tinymce.core.caret.CaretUtils',
    'tinymce.core.caret.CaretWalker',
    'tinymce.core.dom.DOMUtils',
    'tinymce.core.text.Bidi'
  ],
  function (Fun, Option, Options, CaretContainer, CaretPosition, CaretUtils, CaretWalker, DOMUtils, Bidi) {
    var isInlineTarget = function (elm) {
      return DOMUtils.DOM.is(elm, 'a[href],code');
    };

    var hasRtlDirection = function (pos) {
      var elm = CaretPosition.isTextPosition(pos) ? pos.container().parentNode : pos.container();
      return DOMUtils.DOM.getStyle(elm, 'direction', true) === 'rtl';
    };

    var isInRtlText = function (pos) {
      var inBidiText = CaretPosition.isTextPosition(pos) ? Bidi.hasStrongRtl(pos.container().data) : false;
      return inBidiText || hasRtlDirection(pos);
    };

    var findInline = function (rootNode, pos) {
      return Option.from(DOMUtils.DOM.getParent(pos.container(), isInlineTarget, rootNode));
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
      var caretWalker = new CaretWalker(node);
      var startPos = forward ? CaretPosition.before(node) : CaretPosition.after(node);
      return Option.from(forward ? caretWalker.next(startPos) : caretWalker.prev(startPos));
    };

    var findCaretPosition = function (rootNode, forward, from) {
      var caretWalker = new CaretWalker(rootNode);
      return Option.from(forward ? caretWalker.next(from) : caretWalker.prev(from));
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
      isInRtlText: isInRtlText,
      isAtInlineEndPoint: isAtInlineEndPoint,
      isAtZwsp: isAtZwsp,
      findCaretPositionIn: findCaretPositionIn,
      findCaretPosition: findCaretPosition,
      normalizePosition: normalizePosition,
      normalizeForwards: normalizeForwards,
      normalizeBackwards: normalizeBackwards
    };
  }
);