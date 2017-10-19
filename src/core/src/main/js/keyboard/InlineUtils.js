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
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.search.Selectors',
    'tinymce.core.EditorSettings',
    'tinymce.core.caret.CaretContainer',
    'tinymce.core.caret.CaretPosition',
    'tinymce.core.caret.CaretUtils',
    'tinymce.core.dom.DOMUtils',
    'tinymce.core.dom.NodeType',
    'tinymce.core.text.Bidi'
  ],
  function (Arr, Fun, Option, Element, Selectors, EditorSettings, CaretContainer, CaretPosition, CaretUtils, DOMUtils, NodeType, Bidi) {
    var isInlineTarget = function (editor, elm) {
      var selector = EditorSettings.getString(editor, 'inline_boundaries_selector').getOr('a[href],code');
      return Selectors.is(Element.fromDom(elm), selector);
    };

    var isRtl = function (element) {
      return DOMUtils.DOM.getStyle(element, 'direction', true) === 'rtl' || Bidi.hasStrongRtl(element.textContent);
    };

    var findInlineParents = function (isInlineTarget, rootNode, pos) {
      return Arr.filter(DOMUtils.DOM.getParents(pos.container(), '*', rootNode), isInlineTarget);
    };

    var findRootInline = function (isInlineTarget, rootNode, pos) {
      var parents = findInlineParents(isInlineTarget, rootNode, pos);
      return Option.from(parents[parents.length - 1]);
    };

    var hasSameParentBlock = function (rootNode, node1, node2) {
      var block1 = CaretUtils.getParentBlock(node1, rootNode);
      var block2 = CaretUtils.getParentBlock(node2, rootNode);
      return block1 && block1 === block2;
    };

    var isAtZwsp = function (pos) {
      return CaretContainer.isBeforeInline(pos) || CaretContainer.isAfterInline(pos);
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
      findRootInline: findRootInline,
      isRtl: isRtl,
      isAtZwsp: isAtZwsp,
      normalizePosition: normalizePosition,
      normalizeForwards: normalizeForwards,
      normalizeBackwards: normalizeBackwards,
      hasSameParentBlock: hasSameParentBlock
    };
  }
);